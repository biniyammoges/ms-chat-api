import { SocketStateService } from "./socket-state.service"

describe('Socket State', () => {
     let socketStateService: SocketStateService;
     beforeEach(() => socketStateService = new SocketStateService())
     afterEach(() => socketStateService['sockets'] = {})

     describe("add", () => {
          it("should add new socket to list of connected sockets", () => {
               let userId = "user1";
               let socket = { id: "socketId1" } as any

               const res = socketStateService.add(userId, socket)
               expect(res).toBe(true);
               expect(socketStateService['sockets']).toEqual({ [userId]: [socket] })
          })
     })

     describe("remove", () => {
          it("should remove  socket from list of connected sockets", () => {
               let userId = "user1";
               let socket1 = { id: "socketId1" } as any
               let socket2 = { id: "socketId2" } as any
               let socket3 = { id: "socketId3" } as any

               socketStateService['sockets'] = { [userId]: [socket1, socket2, socket3] }

               const res = socketStateService.remove(userId, socket1)
               expect(res).toBe(true);
               expect(socketStateService['sockets']).toEqual({ [userId]: [socket2, socket3] })
          })
     })

     describe("get", () => {
          it("should return list of connected socket with same user", () => {
               let userId = "user1";
               let socket1 = { id: "socketId1" } as any
               let socket2 = { id: "socketId2" } as any
               let socket3 = { id: "socketId3" } as any

               socketStateService['sockets'] = { [userId]: [socket1, socket2, socket3] }

               const res = socketStateService.get(userId)
               expect(res).toEqual([socket1, socket2, socket3])
          })
     })

     describe("getAll", () => {
          it("should return list of connected socket with same user", () => {
               let userId = "user1";
               let userId2 = "user2"
               let socket1 = { id: "socketId1" } as any
               let socket2 = { id: "socketId2" } as any
               let socket3 = { id: "socketId3" } as any
               let socketUser2 = { id: "socketuserid1" }

               socketStateService['sockets'] = { [userId]: [socket1, socket2, socket3], [userId2]: [socketUser2] }

               const res = socketStateService.getAll()
               expect(res).toEqual([socket1, socket2, socket3, socketUser2])
          })
     })

})