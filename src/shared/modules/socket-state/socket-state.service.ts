import { Injectable } from "@nestjs/common";
import { Socket } from 'socket.io'

@Injectable()
export class SocketStateService {
     constructor() { }

     private sockets: Record<string, Socket[]> = {};

     add(userId: string, socket: Socket): boolean {
          let existingSockets = this.sockets[userId] || []

          existingSockets = [...existingSockets, socket]
          this.sockets = { ...this.sockets, [userId]: existingSockets }
          return true
     }

     remove(userId: string, socket: Socket) {
          let existingSockets = this.sockets[userId];
          if (!existingSockets) return false;

          existingSockets = existingSockets.filter(s => s.id !== socket.id);
          this.sockets = { ...this.sockets, [userId]: existingSockets }
          return true
     }

     get(userId: string): Socket[] {
          return this.sockets[userId] || []
     }

     getAll(): Socket[] {
          return Object.entries(this.sockets).reduce<Socket[]>((all, [key, value]) => {
               return [...all, ...value]
          }, [])
     }
}