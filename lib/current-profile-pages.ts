import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest } from "next";
import { db } from "./db";

export const currentProfilePages = async (request: NextApiRequest) => {
	const { userId } = getAuth(request);
	if (!userId) return null;
	return await db.profile.findUnique({ where: { userId } });
};
