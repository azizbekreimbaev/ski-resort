import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { Types } from 'mongoose';
import WebSocket, { Server } from 'ws';
import { AuthService } from '../components/auth/auth.service';
import { ChatHistoryService } from './chat-history.service';
import { ChatMember, ChatMessage } from './chat-message';

interface InfoPayload {
  event: 'info';
  totalClients: number;
  memberData: ChatMember | null;
  action: 'joined' | 'left';
}

@WebSocketGateway({ transports: ['websocket'], secure: false })
export class SocketGateway {
  private readonly logger = new Logger('SocketEventGateway');
  // Only clients whose history has been delivered participate in live chat.
  private readonly clientsAuthMap = new Map<WebSocket, ChatMember | null>();
  private operations: Promise<void> = Promise.resolve();

  constructor(
    private readonly authService: AuthService,
    private readonly historyService: ChatHistoryService,
  ) {}

  @WebSocketServer()
  server!: Server;

  public afterInit(): void {
    this.logger.verbose('WebSocket server initialized');
  }

  private async retrieveAuth(req: IncomingMessage): Promise<ChatMember | null> {
    try {
      const token = new URL(
        req.url ?? '/',
        'http://localhost',
      ).searchParams.get('token');
      if (!token) return null;
      const member = await this.authService.verifyAuth(token);
      const memberId: unknown = member._id;
      if (
        !(memberId instanceof Types.ObjectId) &&
        typeof memberId !== 'string'
      ) {
        return null;
      }
      // Never broadcast or persist contact fields, passwords, or token claims.
      return {
        _id: typeof memberId === 'string' ? memberId : memberId.toHexString(),
        memberNick: member.memberNick,
        memberImage: member.memberImage ?? '',
      };
    } catch {
      // Missing or invalid tokens retain the existing guest access behavior.
      return null;
    }
  }

  private enqueue(operation: () => Promise<void>): Promise<void> {
    // History snapshot and activation cannot interleave with save/broadcast.
    const result = this.operations.then(operation);
    // A failed operation must not block subsequent connections or messages.
    this.operations = result.catch(() => undefined);
    return result;
  }

  public async handleConnection(
    client: WebSocket,
    req: IncomingMessage,
  ): Promise<void> {
    const member = await this.retrieveAuth(req);
    await this.enqueue(async () => {
      if (client.readyState !== WebSocket.OPEN) return;
      let list: ChatMessage[];
      try {
        list = await this.historyService.getMessages();
      } catch {
        this.logger.warn('Chat history unavailable');
        this.sendError(
          client,
          'HISTORY_UNAVAILABLE',
          'Chat history is unavailable. Please reconnect.',
        );
        client.close(1013, 'Chat history unavailable');
        return;
      }
      // Redis may respond after the visitor has already disconnected.
      if (client.readyState !== WebSocket.OPEN) return;
      this.clientsAuthMap.set(client, member);
      this.emitMessage({
        event: 'info',
        totalClients: this.clientsAuthMap.size,
        memberData: member,
        action: 'joined',
      });
      client.send(JSON.stringify({ event: 'getMessages', list }));
    });
  }

  public handleDisconnect(client: WebSocket): void {
    // Failed or still-loading connections were never counted as joined.
    if (!this.clientsAuthMap.has(client)) return;
    const member = this.clientsAuthMap.get(client) ?? null;
    this.clientsAuthMap.delete(client);
    this.emitMessage({
      event: 'info',
      totalClients: this.clientsAuthMap.size,
      memberData: member,
      action: 'left',
    });
  }

  @SubscribeMessage('message')
  public async handleMessage(
    client: WebSocket,
    payload: unknown,
  ): Promise<void> {
    // Validate before storage without altering valid message text.
    if (
      typeof payload !== 'string' ||
      !payload.trim() ||
      payload.length > 2000
    ) {
      this.sendError(
        client,
        'INVALID_MESSAGE',
        'Messages must contain 1-2,000 characters and cannot be blank.',
      );
      return;
    }
    await this.enqueue(async () => {
      if (
        !this.clientsAuthMap.has(client) ||
        client.readyState !== WebSocket.OPEN
      )
        return;
      const message: ChatMessage = {
        event: 'message',
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        text: payload,
        memberData: this.clientsAuthMap.get(client) ?? null,
      };
      try {
        // A live echo confirms storage completed; failed saves never broadcast.
        await this.historyService.appendMessage(message);
      } catch {
        this.logger.warn('Chat message save failed');
        this.sendError(
          client,
          'MESSAGE_SAVE_FAILED',
          'Message could not be confirmed saved.',
        );
        return;
      }
      this.emitMessage(message);
    });
  }

  private sendError(client: WebSocket, code: string, message: string): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: 'error', code, message }));
    }
  }

  private emitMessage(message: InfoPayload | ChatMessage): void {
    // Include the sender to preserve the existing message echo behavior.
    for (const client of this.clientsAuthMap.keys()) {
      if (client.readyState === WebSocket.OPEN)
        client.send(JSON.stringify(message));
    }
  }
}
