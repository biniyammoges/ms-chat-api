import { Module } from "@nestjs/common";
import { SocketStateModule } from "./socket-state/socket-state.module";

@Module({ imports: [SocketStateModule], exports: [SocketStateModule] })
export class SharedModule { }