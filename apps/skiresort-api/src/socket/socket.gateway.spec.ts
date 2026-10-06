import { Logger } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { Test } from '@nestjs/testing';
import { AddressInfo } from 'net';
import { Server as HttpServer } from 'http';
import WebSocket, { Server } from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { SocketGateway } from './socket.gateway';
import { SocketModule } from './socket.module';

jest.mock('uuid', () => ({ v4: () => 'socket-fixture-id' }));

interface ChatFrame {
  event: string;
  text?: string;
  memberData?: unknown;
  list?: ChatFrame[];
}

describe('Original chat compatibility', () => {
  const member = { _id: 'fixture-member', memberNick: 'Skier' };
  let gateway: SocketGateway;
  let verifyAuth: jest.Mock;
  const client = () => ({
    readyState: WebSocket.OPEN,
    send: jest.fn<void, [string]>(),
  });
  const frames = (socket: ReturnType<typeof client>) =>
    socket.send.mock.calls.map(([frame]) => JSON.parse(frame) as ChatFrame);

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => undefined);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    verifyAuth = jest.fn().mockResolvedValue(member);
    gateway = new SocketGateway({ verifyAuth } as unknown as AuthService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('identifies a token, broadcasts joined state and sends history only to the new client', async () => {
    const existing = client();
    const joining = client();
    gateway.server = {
      clients: new Set([existing, joining]),
    } as unknown as Server;
    await gateway.handleConnection(
      joining as unknown as WebSocket,
      { url: '/?token=fixture-token' } as unknown as any[],
    );
    expect(verifyAuth).toHaveBeenCalledWith('fixture-token');
    expect(frames(existing)).toEqual([
      { event: 'info', totalClients: 1, memberData: member, action: 'joined' },
    ]);
    expect(frames(joining)).toEqual([
      ...frames(existing),
      { event: 'getMessages', list: [] },
    ]);
  });

  it.each(['/', '/?token=invalid'])(
    'keeps failed authentication as a guest for %s',
    async (url) => {
      verifyAuth.mockRejectedValue(new Error('Invalid fixture token'));
      const guest = client();
      gateway.server = {
        clients: new Set([guest]),
      } as unknown as Server;
      await gateway.handleConnection(
        guest as unknown as WebSocket,
        { url } as unknown as any[],
      );
      await gateway.handleMessage(guest, 'Guest message');
      expect(frames(guest)[0]).toMatchObject({
        memberData: null,
        action: 'joined',
      });
      expect(frames(guest)[2]).toEqual({
        event: 'message',
        text: 'Guest message',
        memberData: null,
      });
    },
  );

  it('echoes messages to the sender and retains only the last five in oldest-first order', async () => {
    const sender = client();
    const closed = { ...client(), readyState: WebSocket.CLOSED };
    gateway.server = {
      clients: new Set([sender, closed]),
    } as unknown as Server;
    await gateway.handleConnection(
      sender as unknown as WebSocket,
      { url: '/?token=fixture-token' } as unknown as any[],
    );
    for (let i = 1; i <= 7; i++)
      await gateway.handleMessage(sender, `Message ${i}`);
    expect(
      frames(sender).filter((frame) => frame.event === 'message'),
    ).toHaveLength(7);
    expect(closed.send).not.toHaveBeenCalled();
    const joining = client();
    gateway.server.clients.add(joining as unknown as WebSocket);
    await gateway.handleConnection(
      joining as unknown as WebSocket,
      { url: '/' } as unknown as any[],
    );
    expect(frames(joining)[1].list?.map((message) => message.text)).toEqual([
      'Message 3',
      'Message 4',
      'Message 5',
      'Message 6',
      'Message 7',
    ]);
  });

  it('broadcasts departure to remaining clients and removes the disconnected identity', async () => {
    const leaving = client();
    const remaining = client();
    gateway.server = {
      clients: new Set([leaving, remaining]),
    } as unknown as Server;
    await gateway.handleConnection(
      leaving as unknown as WebSocket,
      { url: '/' } as unknown as any[],
    );
    leaving.send.mockClear();
    remaining.send.mockClear();
    await gateway.handleDisconnect(leaving as unknown as WebSocket);
    expect(leaving.send).not.toHaveBeenCalled();
    expect(frames(remaining)).toEqual([
      { event: 'info', totalClients: 0, memberData: member, action: 'left' },
    ]);
    await gateway.handleMessage(leaving, 'Fixture after removal');
    expect(frames(remaining)[1].memberData).toBeNull();
  });

  it('wires SocketModule and accepts the native WsAdapter event/data envelope', async () => {
    const module = await Test.createTestingModule({ imports: [SocketModule] })
      .overrideProvider(AuthService)
      .useValue({ verifyAuth })
      .compile();
    const app = module.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));
    let socket: WebSocket | undefined;
    try {
      await app.listen(0, '127.0.0.1');
      const httpServer = app.getHttpServer() as HttpServer;
      const port = (httpServer.address() as AddressInfo).port;
      const received: ChatFrame[] = [];
      socket = new WebSocket(`ws://127.0.0.1:${port}/?token=fixture-token`);
      const history = new Promise<void>((resolve, reject) => {
        socket!.on('error', reject);
        socket!.on('message', (data) => {
          const frame = JSON.parse((data as Buffer).toString()) as ChatFrame;
          received.push(frame);
          if (frame.event === 'getMessages') resolve();
        });
      });
      await history;
      expect(received).toEqual([
        {
          event: 'info',
          totalClients: 1,
          memberData: member,
          action: 'joined',
        },
        { event: 'getMessages', list: [] },
      ]);
      const echoed = new Promise<ChatFrame>((resolve) =>
        socket!.once('message', (data) =>
          resolve(JSON.parse((data as Buffer).toString()) as ChatFrame),
        ),
      );
      socket.send(
        JSON.stringify({ event: 'message', data: 'Transport fixture' }),
      );
      expect(await echoed).toEqual({
        event: 'message',
        text: 'Transport fixture',
        memberData: member,
      });
    } finally {
      socket?.terminate();
      await app.close();
    }
  });
});
