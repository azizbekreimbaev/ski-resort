import { Logger } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { Test } from '@nestjs/testing';
import { IncomingMessage, Server as HttpServer } from 'http';
import { AddressInfo } from 'net';
import WebSocket, { Server } from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { ChatHistoryService } from './chat-history.service';
import { ChatMessage } from './chat-message';
import { SocketGateway } from './socket.gateway';
import { SocketModule } from './socket.module';

jest.mock('uuid', () => ({ v4: () => 'socket-fixture-id' }));

type Frame = Partial<ChatMessage> & {
  event: string;
  list?: ChatMessage[];
  code?: string;
  action?: string;
  totalClients?: number;
};
const member = {
  _id: 'fixture-member',
  memberNick: 'Skier',
  memberImage: 'skier.png',
  memberPhone: 'private',
  memberPassword: 'secret',
  accessToken: 'private',
};
const publicMember = {
  _id: member._id,
  memberNick: member.memberNick,
  memberImage: member.memberImage,
};
const request = (url = '/?token=fixture-token') => ({ url }) as IncomingMessage;
const client = () => ({
  readyState: WebSocket.OPEN as number,
  send: jest.fn<void, [string]>(),
  close: jest.fn(),
});
type Client = ReturnType<typeof client>;
const socket = (value: Client) => value as unknown as WebSocket;
const frames = (value: Client) =>
  value.send.mock.calls.map(([frame]) => JSON.parse(frame) as Frame);

// A controllable promise lets tests reproduce connections and sends overlapping Redis calls.
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe('Durable shared chat', () => {
  let gateway: SocketGateway;
  let verifyAuth: jest.Mock;
  let history: { getMessages: jest.Mock; appendMessage: jest.Mock };
  let stored: ChatMessage[];
  const connect = async (value: Client, url?: string) => {
    gateway.server.clients.add(socket(value));
    await gateway.handleConnection(socket(value), request(url));
  };

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    stored = [];
    verifyAuth = jest.fn().mockResolvedValue(member);
    history = {
      getMessages: jest
        .fn()
        .mockImplementation(() => Promise.resolve([...stored])),
      appendMessage: jest.fn().mockImplementation((message: ChatMessage) => {
        stored.push(message);
        stored = stored.slice(-500);
        return Promise.resolve();
      }),
    };
    gateway = new SocketGateway(
      { verifyAuth } as unknown as AuthService,
      history as unknown as ChatHistoryService,
    );
    gateway.server = { clients: new Set() } as unknown as Server;
  });
  afterEach(() => jest.restoreAllMocks());

  it('preserves joined/history frames and exposes only public identity', async () => {
    const existing = client();
    const joining = client();
    await connect(existing);
    existing.send.mockClear();
    await connect(joining);
    expect(verifyAuth).toHaveBeenCalledWith('fixture-token');
    expect(frames(existing)).toEqual([
      {
        event: 'info',
        totalClients: 2,
        memberData: publicMember,
        action: 'joined',
      },
    ]);
    expect(frames(joining)).toEqual([
      ...frames(existing),
      { event: 'getMessages', list: [] },
    ]);
    await gateway.handleMessage(socket(joining), '  Hello  ');
    expect(stored[0]).toMatchObject({
      event: 'message',
      text: '  Hello  ',
      memberData: publicMember,
    });
    expect(stored[0].id).toEqual(expect.any(String));
    expect(new Date(stored[0].createdAt).toISOString()).toBe(
      stored[0].createdAt,
    );
    expect(frames(joining).at(-1)).toEqual(stored[0]);
    expect(JSON.stringify(stored)).not.toContain('private');
    expect(JSON.stringify(stored)).not.toContain('secret');
  });

  it.each(['/', '/?token=invalid'])(
    'allows guest reading and posting for %s',
    async (url) => {
      verifyAuth.mockRejectedValue(new Error('Invalid token'));
      const guest = client();
      await connect(guest, url);
      await gateway.handleMessage(socket(guest), 'Guest message');
      expect(frames(guest)[0].memberData).toBeNull();
      expect(stored[0].memberData).toBeNull();
    },
  );

  it('returns exactly the newest 500 oldest first and survives a gateway replacement', async () => {
    const sender = client();
    await connect(sender);
    for (let i = 1; i <= 503; i++)
      await gateway.handleMessage(socket(sender), `Message ${i}`);
    expect(stored).toHaveLength(500);
    gateway = new SocketGateway(
      { verifyAuth } as unknown as AuthService,
      history as unknown as ChatHistoryService,
    );
    gateway.server = { clients: new Set() } as unknown as Server;
    const visitor = client();
    await connect(visitor, '/');
    const list = frames(visitor)[1].list!;
    expect(list).toHaveLength(500);
    expect(list[0].text).toBe('Message 4');
    expect(list[499].text).toBe('Message 503');
  });

  it.each([null, {}, 123, '', '   ', 'x'.repeat(2001)])(
    'rejects invalid payload without writing: %p',
    async (payload) => {
      const sender = client();
      await connect(sender);
      await gateway.handleMessage(socket(sender), payload);
      expect(frames(sender).at(-1)?.code).toBe('INVALID_MESSAGE');
      expect(history.appendMessage).not.toHaveBeenCalled();
    },
  );

  it('accepts a 2000-character message', async () => {
    const sender = client();
    await connect(sender);
    await gateway.handleMessage(socket(sender), 'x'.repeat(2000));
    expect(stored[0].text).toHaveLength(2000);
  });

  it('does not echo before persistence and serializes simultaneous sends', async () => {
    const sender = client();
    await connect(sender);
    sender.send.mockClear();
    const saving = deferred<void>();
    history.appendMessage.mockImplementationOnce(() => saving.promise);
    const first = gateway.handleMessage(socket(sender), 'First');
    const second = gateway.handleMessage(socket(sender), 'Second');
    await Promise.resolve();
    expect(history.appendMessage).toHaveBeenCalledTimes(1);
    expect(sender.send).not.toHaveBeenCalled();
    saving.resolve(undefined);
    await Promise.all([first, second]);
    expect(frames(sender).map((frame) => frame.text)).toEqual([
      'First',
      'Second',
    ]);
  });

  it('delivers history before messages submitted during history loading', async () => {
    const sender = client();
    await connect(sender);
    await gateway.handleMessage(socket(sender), 'Earlier');
    const reading = deferred<ChatMessage[]>();
    const started = deferred<void>();
    history.getMessages.mockImplementationOnce(() => {
      started.resolve(undefined);
      return reading.promise;
    });
    const visitor = client();
    const connection = connect(visitor);
    await started.promise;
    const sending = gateway.handleMessage(socket(sender), 'Later');
    expect(visitor.send).not.toHaveBeenCalled();
    reading.resolve([...stored]);
    await Promise.all([connection, sending]);
    expect(frames(visitor).map((frame) => frame.event)).toEqual([
      'info',
      'getMessages',
      'message',
    ]);
    expect(frames(visitor)[1].list?.map((message) => message.text)).toEqual([
      'Earlier',
    ]);
    expect(frames(visitor)[2].text).toBe('Later');
  });

  it('includes a message saved during joining exactly once in history', async () => {
    const sender = client();
    await connect(sender);
    const saving = deferred<void>();
    const started = deferred<void>();
    history.appendMessage.mockImplementationOnce(
      async (message: ChatMessage) => {
        started.resolve(undefined);
        await saving.promise;
        stored.push(message);
      },
    );
    const sending = gateway.handleMessage(socket(sender), 'During join');
    await started.promise;
    const visitor = client();
    const connection = connect(visitor);
    saving.resolve(undefined);
    await Promise.all([sending, connection]);
    expect(frames(visitor).map((frame) => frame.event)).toEqual([
      'info',
      'getMessages',
    ]);
    expect(frames(visitor)[1].list?.map((message) => message.text)).toEqual([
      'During join',
    ]);
  });

  it('reports failed or timed-out saves without broadcast and recovers afterward', async () => {
    const sender = client();
    const other = client();
    await connect(sender);
    await connect(other);
    other.send.mockClear();
    history.appendMessage.mockRejectedValueOnce(new Error('TimeoutError'));
    await gateway.handleMessage(socket(sender), 'Failed');
    expect(frames(sender).at(-1)?.code).toBe('MESSAGE_SAVE_FAILED');
    expect(other.send).not.toHaveBeenCalled();
    await gateway.handleMessage(socket(sender), 'Recovered');
    expect(frames(other)[0].text).toBe('Recovered');
  });

  it('closes failed history connections without announcing joined or decrementing counts', async () => {
    const existing = client();
    await connect(existing);
    existing.send.mockClear();
    history.getMessages.mockRejectedValueOnce(new Error('Unavailable'));
    const visitor = client();
    await connect(visitor);
    expect(frames(visitor)[0].code).toBe('HISTORY_UNAVAILABLE');
    expect(visitor.close).toHaveBeenCalledWith(
      1013,
      'Chat history unavailable',
    );
    gateway.handleDisconnect(socket(visitor));
    expect(existing.send).not.toHaveBeenCalled();
    const next = client();
    await connect(next);
    expect(frames(next)[0].totalClients).toBe(2);
  });

  it('does not activate a client disconnected during history loading', async () => {
    const reading = deferred<ChatMessage[]>();
    const started = deferred<void>();
    history.getMessages.mockImplementationOnce(() => {
      started.resolve(undefined);
      return reading.promise;
    });
    const visitor = client();
    const connection = connect(visitor);
    await started.promise;
    visitor.readyState = WebSocket.CLOSED;
    gateway.handleDisconnect(socket(visitor));
    reading.resolve([]);
    await connection;
    expect(visitor.send).not.toHaveBeenCalled();
    const next = client();
    await connect(next);
    expect(frames(next)[0].totalClients).toBe(1);
  });

  it('announces departure once and stops sending to disconnected sockets', async () => {
    const leaving = client();
    const remaining = client();
    await connect(leaving);
    await connect(remaining);
    leaving.send.mockClear();
    remaining.send.mockClear();
    gateway.handleDisconnect(socket(leaving));
    gateway.handleDisconnect(socket(leaving));
    expect(frames(remaining)).toEqual([
      {
        event: 'info',
        totalClients: 1,
        memberData: publicMember,
        action: 'left',
      },
    ]);
    await gateway.handleMessage(socket(leaving), 'After removal');
    expect(leaving.send).not.toHaveBeenCalled();
    expect(history.appendMessage).not.toHaveBeenCalled();
    remaining.readyState = WebSocket.CLOSED;
    expect(frames(remaining)).toHaveLength(1);
  });

  it('wires SocketModule and preserves the native WsAdapter envelope', async () => {
    const module = await Test.createTestingModule({ imports: [SocketModule] })
      .overrideProvider(getModelToken('Member'))
      .useValue({})
      .overrideProvider(getModelToken('RefreshSession'))
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({ get: () => 'isolated-test-key' })
      .overrideProvider(AuthService)
      .useValue({ verifyAuth })
      .overrideProvider(ChatHistoryService)
      .useValue(history)
      .compile();
    const app = module.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));
    let connection: WebSocket | undefined;
    try {
      await app.listen(0, '127.0.0.1');
      const port = (
        (app.getHttpServer() as HttpServer).address() as AddressInfo
      ).port;
      const received: Frame[] = [];
      connection = new WebSocket(`ws://127.0.0.1:${port}/?token=fixture-token`);
      await new Promise<void>((resolve, reject) => {
        connection!.on('error', reject);
        connection!.on('message', (data: Buffer) => {
          const frame = JSON.parse(data.toString()) as Frame;
          received.push(frame);
          if (frame.event === 'getMessages') resolve();
        });
      });
      expect(received).toEqual([
        {
          event: 'info',
          totalClients: 1,
          memberData: publicMember,
          action: 'joined',
        },
        { event: 'getMessages', list: [] },
      ]);
      const echoed = new Promise<Frame>((resolve) =>
        connection!.once('message', (data: Buffer) =>
          resolve(JSON.parse(data.toString()) as Frame),
        ),
      );
      connection.send(
        JSON.stringify({ event: 'message', data: 'Transport fixture' }),
      );
      expect(await echoed).toMatchObject({
        event: 'message',
        text: 'Transport fixture',
        memberData: publicMember,
      });
    } finally {
      connection?.terminate();
      await app.close();
    }
  });
});
