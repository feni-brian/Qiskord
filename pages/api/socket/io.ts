import { NextApiResponseServerIO } from "@/types";
import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";

export const config = {
	api: {
		bodyParser: false,
	}
};

const ioHandler = (request: NextApiRequest, result: NextApiResponseServerIO) => {
	if (!result.socket.server.io) {
		const path = "/api/socket/io";
		const httpServer: NetServer = result.socket.server as any;
		const io = new ServerIO(httpServer, { path, addTrailingSlash: false });

		result.socket.server.io = io;
	}

	result.end();
};

export default ioHandler;
