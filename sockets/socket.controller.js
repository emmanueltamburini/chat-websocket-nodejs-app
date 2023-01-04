import { DISCONNECTED_SOCKET_PATH, RECEIVE_MESSAGE, RECEIVE_PRIVATE_MESSAGE, SEND_MESSAGE, USER_CONNECTED_SOCKET_PATH } from "../constant/routes.constant.js";
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

    socket.emit(RECEIVE_MESSAGE, chatMessages.last10Message)

    socket.join(user.id);

    socket.on(DISCONNECTED_SOCKET_PATH, () => {
        chatMessages.disconnectUser(user.id);
        io.emit(USER_CONNECTED_SOCKET_PATH, chatMessages.usersArray);
    });

    socket.on(SEND_MESSAGE, async (body) => {
        const {message, uid} = body;

        if(uid) {
            socket.to(uid).emit(RECEIVE_PRIVATE_MESSAGE, {from: user.name, message})
            return;
        }

        chatMessages.sendMessage(user.id, user.name, message);
        io.emit(RECEIVE_MESSAGE, chatMessages.last10Message)
    });

    console.log('Connected user', user.name);
}

export default socketController;