import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const profile = await currentProfile();
		if (!profile) return new NextResponse("Unauthorised User!", { status: 401 });
		
		const { name, type } = await request.json();
		const { searchParams } = new URL(request.url);
		const serverId = searchParams.get("serverId");

		if (!serverId) return new NextResponse("Missing Server ID!", { status: 400 });
		if (name === "General") return new NextResponse("Cannot rename channel to 'General'!", { status: 400 });

		const server = await db.server.update({
			where: { id: serverId, members: { some: { profileId: profile.id, role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] } } } },
			data: { channels: { create: { profileId: profile.id, name, type } } },
		});

		return NextResponse.json(server);
	} catch (error) {
		console.log("CHANNELS_POST", error);
		return new NextResponse("Internal server error!", { status: 500 });
	}
}
