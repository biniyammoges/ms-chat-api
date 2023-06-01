import { INestApplication } from "@nestjs/common";
import { SocketAdapter } from "./shared/modules/socket-state/socket.adapter";
import { SocketStateService } from "./shared/modules/socket-state/socket-state.service";

export const initalizeWsAdapter = (app: INestApplication): INestApplication => {
     app.useWebSocketAdapter(new SocketAdapter(app, app.get(SocketStateService)))
     return app
}