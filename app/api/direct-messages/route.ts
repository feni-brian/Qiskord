import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { DirectMessage } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGES_BATCH = 10;

export async function GET(request: Request) {
	try {
		const profile = await currentProfile();
		const { searchParams } = new URL(request.url);
		const cursor = searchParams.get("cursor");
		const conversationId = searchParams.get("conversationId");

		if (!profile) return new NextResponse("Unauthorized User!", { status: 401 });
		if (!conversationId) return new NextResponse("Missing Conversation ID!", { status: 400 });

		let messages: DirectMessage[] = [];

		messages = cursor
			? await db.directMessage.findMany({
					take: MESSAGES_BATCH,
					skip: 1,
					cursor: { id: cursor },
					where: { conversationId },
					include: { member: { include: { profile: true } } },
					orderBy: { createdAt: "desc" },
			  })
			: await db.directMessage.findMany({ take: MESSAGES_BATCH, where: { conversationId }, include: { member: { include: { profile: true } } }, orderBy: { createdAt: "desc" } 
		});

		const nextCursor = messages.length === MESSAGES_BATCH ? messages[messages.length - 1].id : null;

		return NextResponse.json({ items: messages, nextCursor });
	} catch (error) {
		console.log("[DIRECT_MESSAGES_GET]", error);
		return new NextResponse("Internal Server Error!", { status: 500 });
	}
}
