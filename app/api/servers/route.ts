import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
	try {
		const profile = await currentProfile();
		if (!profile) return new NextResponse("Unauthorized User!", { status: 401 });
		const { name, imageUrl } = await request.json();
		const server = await db.server.create({
			data: {
				profileId: profile.id,
				name,
				imageUrl,
				invite: uuidv4(),
				channels: { create: [{ name: "General", profileId: profile.id }] },
				members: { create: [{ profileId: profile.id, role: MemberRole.ADMIN }] },
			},
		});
		return NextResponse.json(server);
	} catch (error) {
		console.log("[SERVER_POST]", error);
		return new NextResponse("Internal Server Error!", { status: 500 });
	}
}
