const io = require('socket.io')(3500, {
  cors: {
    origin: '*',
  },
});
io.on('connection', async (socket) => {
  socket.on('message-event', (room) => {
    if (room === '') {
      return;
    } else {
      socket.to(room).emit('recieve-message');
    }
  });
  socket.on('joinRoom', async (room) => {
    if (socket.rooms.has(room)) {
      return;
    } else {
      await socket.join(room);
    }
  });
});
