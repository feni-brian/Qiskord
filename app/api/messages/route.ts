import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { Message } from "@prisma/client";
import { NextResponse } from "next/server";

const MESSAGES_BATCH = 10;

export async function GET(request: Request) {
	try {
		const profile = await currentProfile();
		const { searchParams } = new URL(request.url);
		const cursor = searchParams.get("cursor");
		const channelId = searchParams.get("channelId");

		if (!profile) return new NextResponse("Unauthorized User!", { status: 401 });
		if (!channelId) return new NextResponse("Missing Channel ID!", { status: 400 });

		let messages: Message[] = [];

		messages = cursor
			? await db.message.findMany({
					take: MESSAGES_BATCH,
					skip: 1,
					cursor: { id: cursor },
					where: { channelId },
					include: { member: { include: { profile: true } } },
					orderBy: { createdAt: "desc" },
			  })
			: await db.message.findMany({ take: MESSAGES_BATCH, where: { channelId }, include: { member: { include: { profile: true } } }, orderBy: { createdAt: "desc" } });

		const nextCursor = messages.length === MESSAGES_BATCH ? messages[messages.length - 1].id : null;

		return NextResponse.json({ items: messages, nextCursor });
	} catch (error) {
		console.log("[MESSAGES_GET]", error);
		return new NextResponse("Internal Server Error!", { status: 500 });
	}
}
