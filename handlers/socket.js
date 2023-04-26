const sockets = [];

module.exports = async (socket) => {
  socket.on("user-handshake", (e) => {
    console.log(e)
  });

/*   socket.on("trade-join", (e) => {
    socket.join(e.trade);
    socket.to(e.trade).emit("trade-user-join", { uuid: e.uuid });
  });

  socket.on("trade-leave", (e) => {
    socket.leave(e.trade);
    socket.to(e.trade).emit("trade-user-join", { uuid: e.uuid });
  });

  socket.on("trade-message", (e) => {
    socket
      .to(e.trade)
      .emit("trade-user-message", { uuid: e.uuid, message: e.message });
  }); */

  socket.on("disconnect", (e) => {
    console.log(e)
  });
};
