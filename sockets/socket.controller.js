import { DISCONNECTED_SOCKET_PATH, USER_CONNECTED_SOCKET_PATH } from "../constant/routes.constant.js";
import { getUserFromJWT } from "../helpers/utils.js";
import ChatMessages from "../models/chat.js";

const chatMessages = new ChatMessages();

const socketController = async (socket, io) => {
    const token = socket.handshake.headers['x-token'];

    const user = await getUserFromJWT(token);

    if(!user) {
        return socket.disconnect();
    }

    chatMessages.connectUser(user);
    io.emit(USER_CONNECTED_SOCKET_PATH, chatMessages.usersArray);

    socket.on(DISCONNECTED_SOCKET_PATH, () => {
        chatMessages.disconnectUser(user.id);
        io.emit(USER_CONNECTED_SOCKET_PATH, chatMessages.usersArray);
    });

    console.log('Connected user', user.name);
}

export default socketController;