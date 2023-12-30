import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIO } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(request: NextApiRequest, result: NextApiResponseServerIO) {
	if (request.method !== "POST") return result.status(405).json({ error: "Prohibited Method!" });

	try {
		const profile = await currentProfilePages(request);
		const { content, fileUrl } = request.body;
		const { serverId, channelId } = request.query;

		if (!profile) return result.status(401).json({ error: "Unauthorized User!" });
		if (!serverId) return result.status(400).json({ error: "Missing Server ID!" });
		if (!channelId) return result.status(400).json({ error: "Missing Channel ID!" });
		if (!content) return result.status(400).json({ error: "Missing Content!" });

		const server = await db.server.findFirst({ where: { id: serverId as string, members: { some: { profileId: profile.id } } }, include: { members: true } });
		if (!server) return result.status(404).json({ message: "Server Not Found!" });

		const channel = await db.channel.findFirst({ where: { id: channelId as string, serverId: serverId as string } });
		if (!channel) return result.status(404).json({ message: "Channel Not Found!" });

		const member = server.members.find((member) => member.profileId === profile.id);
		if (!member) return result.status(404).json({ message: "Member Not Found!" });

		const message = await db.message.create({ data: { content, fileUrl, channelId: channelId as string, memberId: member.id }, include: { member: { include: { profile: true } } } });
		const channelKey = `chat:${channelId}:messages`;

		result?.socket?.server?.io?.emit(channelKey, message);
		return result.status(200).json(message);
	} catch (error) {
		console.log("[MESSAGES_POST]", error);
		return result.status(500).json({ message: "Internal Server Error!" });
	}
}
