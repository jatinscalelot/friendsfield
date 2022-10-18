const io = require("socket.io")();
const socketapi = { io: io };
module.exports.server = socketapi;
io.on("connection", function (client) {
    client.on('init', async function (data) {
        client.join(data.channelID);
    });
});