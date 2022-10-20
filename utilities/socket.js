const io = require("socket.io")();
const socketapi = { io: io };
module.exports.server = socketapi;
io.on("connection", function (client) {
    client.on('init', async function (data) {
        client.join(data.channelID);
    });
});
module.exports.onIncomingChat = (channelId, customerId) => {
    io.in(channelId).emit('newMessage', customerId);
};
module.exports.onIncomingFriendRequest = (channelId, friendrequestId) => {
    io.in(channelId).emit('newFriendRequest', friendrequestId);
};
module.exports.onIncomingCall = (channelId, friendId) => {
    io.in(channelId).emit('incomingCall', friendId);
};
module.exports.onNewNotification = (channelId, notificationId) => {
    io.in(channelId).emit('incomingNotification', notificationId);
}
