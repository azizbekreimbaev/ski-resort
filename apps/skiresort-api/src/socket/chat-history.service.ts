import { Injectable } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { ChatMessage } from './chat-message';

// Atomic append and trim prevents concurrent writes from exceeding 500 entries.
export const APPEND_CHAT_MESSAGE = `
redis.call('RPUSH', KEYS[1], ARGV[1])
redis.call('LTRIM', KEYS[1], -500, -1)
return redis.call('LLEN', KEYS[1])
`;

@Injectable()
export class ChatHistoryService {
  private readonly redis: Redis;
  private readonly key: string;

  constructor() {
    // Missing configuration must not silently turn durable chat into memory-only chat.
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    const key = process.env.CHAT_HISTORY_KEY?.trim();
    if (!url || !token || !key) {
      throw new Error(
        'Chat requires UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN and CHAT_HISTORY_KEY',
      );
    }
    if (new URL(url).protocol !== 'https:') {
      throw new Error('UPSTASH_REDIS_REST_URL must use HTTPS');
    }
    this.key = key;
    this.redis = new Redis({
      url,
      token,
      // Fresh timeout per request; uncertain writes cannot safely be retried.
      signal: () => AbortSignal.timeout(5000),
      retry: { retries: 0 },
      enableAutoPipelining: false,
      enableTelemetry: false,
    });
  }

  public async getMessages(): Promise<ChatMessage[]> {
    // RPUSH preserves oldest-first order; negative indices select the newest 500.
    return await this.redis.lrange<ChatMessage>(this.key, -500, -1);
  }

  public async appendMessage(message: ChatMessage): Promise<void> {
    // No expiry is set: history survives idle periods and backend restarts.
    await this.redis.eval(
      APPEND_CHAT_MESSAGE,
      [this.key],
      [JSON.stringify(message)],
    );
  }
}
