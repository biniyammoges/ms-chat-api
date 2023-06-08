import { Injectable, Logger, } from "@nestjs/common";
import { Socket } from 'socket.io'

@Injectable()
export class SocketStateService {
     private sockets = new Map<string, Socket[]>();
     private logger = new Logger(SocketStateService.name)

     add(userId: string, socket: Socket): boolean {
          const existingSockets = this.sockets.get(userId) || [];

          const sockets = [...existingSockets, socket];

          this.sockets.set(userId, sockets);

          return true;
     }

     remove(userId: string, socket: Socket): boolean {
          const existingSockets = this.sockets.get(userId);

          if (!existingSockets) {
               return true;
          }

          const sockets = existingSockets.filter(s => s.id !== socket.id);

          if (!sockets.length) {
               this.sockets.delete(userId);
          } else {
               this.sockets.set(userId, sockets);
          }

          return true;
     }

     get(userId: string): Socket[] {
          return this.sockets.get(userId) || []
     }

     getAll(): Socket[] {
          const all = [];

          for (const [_k, v] of this.sockets) {
               for (const s of v) {
                    all.push(s)
               }
          }

          return all;
     }

     getSocketsInRoom(room: string, excludeMySocketId?: string) {
          let socketsInRoom: Socket[] = []

          const allSockets = this.getAll()

          const sockets = allSockets.filter(s => s.id !== excludeMySocketId)
          for (const socket of sockets) {
               if (socket.rooms.has(room)) {
                    socketsInRoom.push(socket)
               }
          }

          return socketsInRoom
     }

     syncSocketRoom(data: { roomId: string, socketId: string, userId: string }, opts: { join: boolean } = { join: true }) {
          const sockets = this.get(data.userId)
          const theSocket = sockets.find(s => s.id === data.socketId);
          let left = false;
          let joined = false

          if (theSocket && opts.join && !theSocket.rooms.has(data.roomId)) {
               theSocket.join(data.roomId)
               joined = true
          }

          else if (theSocket && !opts.join && theSocket.rooms.has(data.roomId)) {
               theSocket.leave(data.roomId)
               left = true
          }


          if (theSocket && joined || theSocket && left)
               this.sockets.set(data.userId, [...(sockets.filter(s => s.id !== data.socketId)), theSocket])
     }
}