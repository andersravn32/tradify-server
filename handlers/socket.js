const sockets = [];

module.exports = async (socket) => {
  socket.on("user-handshake", (e) => {
    // Join own personal room for others to emit to
    socket.join(e.uuid);

    socket.emit("user-handshake", {
      uuid: e.uuid,
    });
  });

  socket.on("user-disconnect", (e) => {
    // Leave own personal room
    socket.leave(e.uuid);

    socket.emit("user-disconnect", {
      uuid: e.uuid,
    });
  });

  socket.on("user-message", (e) => {
    socket.to(e.uuid).emit("user-message", {
      uuid: e.uuid,
      message: e.message
    })
  })

  socket.on("disconnect", (e) => {
    console.log(e);
  });
};
