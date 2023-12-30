import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { NextApiResponseServerIO } from "@/types";
import { MemberRole } from "@prisma/client";
import { NextApiRequest } from "next";

export default async function handler(request: NextApiRequest, result: NextApiResponseServerIO) {
	if (request.method !== "DELETE" && request.method !== "PATCH") return result.status(405).json({ error: "Prohibited Method!" });

	try {
		const profile = await currentProfilePages(request);
		const { directMessageId, conversationId } = request.query;
		const { content } = request.body;

		if (!profile) return result.status(401).json({ error: "Unauthorized User!" });
		if (!conversationId) return result.status(400).json({ error: "Missing Conversatin ID!" });

		const conversation = await db.conversation.findFirst({
			where: { id: conversationId as string, OR: [{ memberOne: { profileId: profile.id } }, { memberTwo: { profileId: profile.id } }] },
			include: { memberOne: { include: { profile: true } }, memberTwo: { include: { profile: true } } },
		});
		if (!conversation) return result.status(404).json({ error: "Conversation Not Found!" });

		const member = conversation.memberOne.profileId === profile.id ? conversation.memberOne : conversation.memberTwo;
		if (!member) return result.status(404).json({ error: "Member Not Found!" });

		let directMessage = await db.directMessage.findFirst({
			where: { id: directMessageId as string, conversationId: conversationId as string },
			include: { member: { include: { profile: true } } },
		});
		if (!directMessage || directMessage.deleted) return result.status(404).json({ error: "Message Not Found!" });

		const isMessageOwner = directMessage.memberId === member.id;
		const isAdmin = member.role === MemberRole.ADMIN;
		const isModerator = member.role === MemberRole.MODERATOR;
		const canModify = isMessageOwner || isAdmin || isModerator;

		if (!canModify) return result.status(401).json({ error: "Unauthorized User!" });
		if (request.method === "DELETE") {
			directMessage = await db.directMessage.update({
				where: { id: directMessageId as string },
				data: { fileUrl: null, content: "This message has been deleted!", deleted: true },
				include: { member: { include: { profile: true } } },
			});
		}
		if (request.method === "PATCH") {
			if (!isMessageOwner) return result.status(401).json({ error: "Unauthorized User!" });
			directMessage = await db.directMessage.update({ where: { id: directMessageId as string }, data: { content }, include: { member: { include: { profile: true } } } });
		}

		const updateKey = `chat:${conversation.id}:messages:update`;

		result?.socket?.server?.io?.emit(updateKey, directMessage);
		return result.status(200).json(directMessage);
	} catch (error) {
		console.log("[MESSAGE_ID]", error);
		return result.status(500).json({ error: "Internal Server Error!" });
	}
}
