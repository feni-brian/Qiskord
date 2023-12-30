import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIO } from "@/types";
import { NextApiRequest } from "next";

export default async function handler(request: NextApiRequest, result: NextApiResponseServerIO) {
	if (request.method !== "POST") return result.status(405).json({ error: "Prohibited Method!" });

	try {
		const profile = await currentProfilePages(request);
		const { content, fileUrl } = request.body;
		const { conversationId } = request.query;

		if (!profile) return result.status(401).json({ error: "Unauthorized User!" });
		if (!conversationId) return result.status(400).json({ error: "Missing Conversation ID!" });
		if (!content) return result.status(400).json({ error: "Missing Content!" });

		const conversation = await db.conversation.findFirst({
			where: { id: conversationId as string, OR: [{ memberOne: { profileId: profile.id } }, { memberTwo: { profileId: profile.id } }] },
			include: { memberOne: { include: { profile: true } }, memberTwo: { include: { profile: true } } },
		});
		if (!conversation) return result.status(404).json({ message: "Conversation Not Found!" });

		const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;
		if (!member) return result.status(404).json({ message: "Member Not Found!" });

		const message = await db.directMessage.create({
			data: { content, fileUrl, conversationId: conversationId as string, memberId: member.id },
			include: { member: { include: { profile: true } } },
		});
		const channelKey = `chat:${conversationId}:messages`;

		result?.socket?.server?.io?.emit(channelKey, message);
		return result.status(200).json(message);
	} catch (error) {
		console.log("[DIRECT_MESSAGES_POST]", error);
		return result.status(500).json({ message: "Internal Server Error!" });
	}
}
