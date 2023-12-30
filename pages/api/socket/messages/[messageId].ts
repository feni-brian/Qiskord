import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIO } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";

export default async function handler(request: NextApiRequest, result: NextApiResponseServerIO) {
	if (request.method !== "DELETE" && request.method !== "PATCH") return result.status(405).json({ error: "Prohibited Method!" });

	try {
		const profile = await currentProfilePages(request);
		const { messageId, serverId, channelId } = request.query;
		const { content } = request.body;

		if (!profile) return result.status(401).json({ error: "Unauthorized User!" });
		if (!serverId) return result.status(400).json({ error: "Missing Server ID!" });
		if (!channelId) return result.status(400).json({ error: "Missing Channel ID!" });

		const server = await db.server.findFirst({ where: { id: serverId as string, members: { some: { profileId: profile.id } } }, include: { members: true } });
		if (!server) return result.status(404).json({ error: "Server Not Found!" });

		const channel = await db.channel.findFirst({ where: { id: channelId as string, serverId: serverId as string } });
		if (!channel) return result.status(404).json({ error: "Channel Not Found!" });

		const member = server.members.find((member) => member.profileId === profile.id);
		if (!member) return result.status(404).json({ error: "Member Not Found!" });

		let message = await db.message.findFirst({ where: { id: messageId as string, channelId: channelId as string }, include: { member: { include: { profile: true } } } });
		if (!message || message.deleted) return result.status(404).json({ error: "Message Not Found!" });

		const isMessageOwner = message.memberId === member.id;
		const isAdmin = member.role === MemberRole.ADMIN;
		const isModerator = member.role === MemberRole.MODERATOR;
		const canModify = isMessageOwner || isAdmin || isModerator;

		if (!canModify) return result.status(401).json({ error: "Unauthorized User!" });
		if (request.method === "DELETE") {
			message = await db.message.update({
				where: { id: messageId as string },
				data: { fileUrl: null, content: "This message has been deleted!", deleted: true },
				include: { member: { include: { profile: true } } },
			});
		}
		if (request.method === "PATCH") {
			if (!isMessageOwner) return result.status(401).json({ error: "Unauthorized User!" });
			message = await db.message.update({ where: { id: messageId as string }, data: { content }, include: { member: { include: { profile: true } } } });
		}

		const updateKey = `chat:${channelId}:messages:update`;

		result?.socket?.server?.io?.emit(updateKey, message);
		return result.status(200).json(message);
	} catch (error) {
		console.log("[MESSAGE_ID]", error);
		return result.status(500).json({ error: "Internal Server Error!" });
	}
}
