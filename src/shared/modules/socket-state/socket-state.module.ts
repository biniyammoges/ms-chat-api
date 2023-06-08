import { Module, Provider } from "@nestjs/common";
import { SocketStateService } from "./socket-state.service";
import { SOCKET_STATE_TOKEN } from "./socket-state.constant";

export const socketStateproviders: Provider[] =
     [{ provide: SOCKET_STATE_TOKEN, useClass: SocketStateService }]

@Module({ providers: [...socketStateproviders], exports: [...socketStateproviders] })
export class SocketStateModule { }