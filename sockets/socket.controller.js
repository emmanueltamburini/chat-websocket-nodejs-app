import { getUserFromJWT } from "../helpers/utils.js";

const socketController = async socket => {
    const token = socket.handshake.headers['x-token'];

    const user = await getUserFromJWT(token);

    if(!user) {
        socket.disconnect();
    }

    console.log('Connected user', user.name);
}

export default socketController;