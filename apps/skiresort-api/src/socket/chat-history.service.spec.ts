import { Redis } from '@upstash/redis';
import {
  APPEND_CHAT_MESSAGE,
  ChatHistoryService,
} from './chat-history.service';
import { ChatMessage } from './chat-message';

jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }));

describe('ChatHistoryService', () => {
  const originalEnv = { ...process.env };
  const lrange = jest.fn();
  const evalCommand = jest.fn();
  const redisConstructor = Redis as jest.MockedClass<typeof Redis>;

  beforeEach(() => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://fixture.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'fixture-token';
    process.env.CHAT_HISTORY_KEY = 'skiresort:test:chat:messages';
    redisConstructor.mockImplementation(
      () => ({ lrange, eval: evalCommand }) as unknown as Redis,
    );
    lrange.mockResolvedValue([]);
    evalCommand.mockResolvedValue(1);
  });
  afterEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it.each([
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'CHAT_HISTORY_KEY',
  ])('fails startup without %s', (name) => {
    delete process.env[name];
    expect(() => new ChatHistoryService()).toThrow('Chat requires');
    expect(redisConstructor).not.toHaveBeenCalled();
  });

  it('rejects insecure URLs', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'http://fixture.upstash.io';
    expect(() => new ChatHistoryService()).toThrow('must use HTTPS');
  });

  it('disables retries and gives each request a fresh five-second abort signal', () => {
    const timeout = jest.spyOn(AbortSignal, 'timeout');
    new ChatHistoryService();
    const options = redisConstructor.mock.calls[0][0];
    expect(options).toMatchObject({
      retry: { retries: 0 },
      enableAutoPipelining: false,
      enableTelemetry: false,
    });
    const signal = options.signal as () => AbortSignal;
    expect(signal()).not.toBe(signal());
    expect(timeout).toHaveBeenCalledTimes(2);
    expect(timeout).toHaveBeenCalledWith(5000);
  });

  it('reads only the newest 500 and preserves their database order', async () => {
    const messages = [{ text: 'Older' }, { text: 'Newer' }];
    lrange.mockResolvedValueOnce(messages);
    expect(await new ChatHistoryService().getMessages()).toEqual(messages);
    expect(lrange).toHaveBeenCalledWith(
      'skiresort:test:chat:messages',
      -500,
      -1,
    );
  });

  it('sends one atomic script with JSON rather than separate append and trim calls', async () => {
    const message: ChatMessage = {
      event: 'message',
      id: 'fixture',
      createdAt: '2026-10-12T00:00:00.000Z',
      text: 'Hello',
      memberData: null,
    };
    await new ChatHistoryService().appendMessage(message);
    expect(evalCommand).toHaveBeenCalledTimes(1);
    expect(evalCommand).toHaveBeenCalledWith(
      APPEND_CHAT_MESSAGE,
      ['skiresort:test:chat:messages'],
      [JSON.stringify(message)],
    );
  });

  it('propagates storage failures without retry or memory fallback', async () => {
    const service = new ChatHistoryService();
    lrange.mockRejectedValueOnce(new Error('TimeoutError'));
    await expect(service.getMessages()).rejects.toThrow('TimeoutError');
    evalCommand.mockRejectedValueOnce(new Error('Unavailable'));
    await expect(service.appendMessage({} as ChatMessage)).rejects.toThrow(
      'Unavailable',
    );
    expect(lrange).toHaveBeenCalledTimes(1);
    expect(evalCommand).toHaveBeenCalledTimes(1);
  });
});
