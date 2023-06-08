import { INestApplication } from "@nestjs/common";
import { SocketAdapter } from "./shared/modules/socket-state/socket.adapter";
import { SOCKET_STATE_TOKEN } from "./shared/modules/socket-state/socket-state.constant";

export const initalizeWsAdapter = (app: INestApplication): INestApplication => {
     app.useWebSocketAdapter(new SocketAdapter(app, app.get(SOCKET_STATE_TOKEN, { strict: false }),))
     return app
}