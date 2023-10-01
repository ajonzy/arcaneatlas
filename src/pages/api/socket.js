import { Server } from 'socket.io';

const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
      console.log('Socket is already running')
    } else {
        console.log('Socket is initializing')
        const io = new Server(res.socket.server, {
            path: "/api/socket_io",
            addTrailingSlash: false
        })
        res.socket.server.io = io

        io.on('connection', (socket) => {
            socket.on('createSession', (sessionId) => {
                const roomClients = io.sockets.adapter.rooms.get(sessionId) || new Set();
                const numberOfClients = roomClients.size;

                if (numberOfClients == 0) {
                    socket.join(sessionId);
                    socket.sessionId = sessionId; 
                    socket.isCreator = true
                    socket.emit('created', sessionId);
                } else {
                    socket.emit('roomExists');
                }
            });

            socket.on('joinSession', (sessionId) => {
                const roomClients = io.sockets.adapter.rooms.get(sessionId) || new Set();
                const numberOfClients = roomClients.size;

                if (numberOfClients == 0) {
                    socket.emit('noRoom');
                } else {
                    socket.join(sessionId);
                    socket.sessionId = sessionId;
                    socket.isCreator = false
                    socket.to(sessionId).emit('joined');
                }
            });

            socket.on("joinData", (data, sessionId) => {
                socket.to(sessionId).emit("joinData", data)
            })

            socket.on("mapChange", (map, sessionId) => {
                socket.to(sessionId).emit("mapChange", map)
            })

            socket.on("playerJoin", (player, sessionId) => {
                if (!socket.isCreator) {
                    socket.playerId = player.id
                }
                socket.to(sessionId).emit("playerJoin", player)
            })

            socket.on("characterCreate", (character, sessionId) => {
                socket.to(sessionId).emit("characterCreate", character)
            })

            socket.on("characterUpdate", (character, sessionId) => {
                socket.to(sessionId).emit("characterUpdate", character)
            })

            socket.on("characterDelete", (character, sessionId) => {
                socket.to(sessionId).emit("characterDelete", character)
            })

            socket.on("moveToken", (id, token, sessionId) => {
                io.in(sessionId).emit("moveToken", id, token)
            })

            socket.on("mapReveal", (data, sessionId) => {
                socket.to(sessionId).emit("mapReveal", data)
            })

            socket.on("dataChange", (data, sessionId) => {
                io.in(sessionId).emit("dataChange", data)
            })

            socket.on("toggleDoorOpen", (coords, sessionId) => {
                io.in(sessionId).emit("toggleDoorOpen", coords)
            })

            socket.on("toggleDiscover", (coords, sessionId) => {
                io.in(sessionId).emit("toggleDiscover", coords)
            })

            socket.on('disconnect', () => {
                if (socket.isCreator) {
                    const roomClients = io.sockets.adapter.rooms.get(socket.sessionId) || new Set();
        
                    roomClients.forEach(clientSocketId => {
                        const clientSocket = io.sockets.sockets.get(clientSocketId);
                        if (clientSocket) {
                            clientSocket.leave(socket.sessionId);
                            clientSocket.emit('creatorLeft');
                        }
                    });
                }
                else {
                    socket.to(socket.sessionId).emit("playerLeft", socket.playerId)
                }
            });
        });
    }
  res.end();
}

export default SocketHandler