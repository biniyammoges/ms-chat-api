import { UseFilters, UsePipes, ValidationPipe } from "@nestjs/common";
import { WebSocketGateway } from "@nestjs/websockets";
import { WebsocketExceptionsFilter } from "src/exceptions/ws-exception";
import { ChatService } from "./chat.service";

@WebSocketGateway()
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@UseFilters(WebsocketExceptionsFilter)
export class ChatGateway {
     constructor(private chatService: ChatService) { }
}