import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '../components/auth/auth.module';
import { ChatHistoryService } from './chat-history.service';

@Module({
  imports: [AuthModule],
  // Keep persistence separate from WebSocket transport and authentication.
  providers: [SocketGateway, ChatHistoryService],
})
export class SocketModule {}
