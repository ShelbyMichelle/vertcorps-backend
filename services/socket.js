// Simple socket service to hold the Server instance for use in other modules
let ioInstance = null;

module.exports = {
  setIO: (io) => {
    ioInstance = io;
  },
  getIO: () => ioInstance,
  emitToUser: (userId, event, payload) => {
    if (!ioInstance) {
      console.warn('socketService.emitToUser called but ioInstance is not set');
      return false;
    }
    try {
      const room = ioInstance.sockets.adapter.rooms.get(`user_${userId}`);
      const socketsInRoom = room ? room.size : 0;
      console.log(`🔔 Emitting '${event}' to user_${userId} (sockets in room: ${socketsInRoom})`);
      ioInstance.to(`user_${userId}`).emit(event, payload);
      return true;
    } catch (err) {
      console.error('socketService.emitToUser error:', err);
      return false;
    }
  },
};
