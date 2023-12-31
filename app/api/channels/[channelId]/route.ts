import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, { params }: { params: { channelId: string } }) {
	try {
		const profile = await currentProfile();
		const { searchParams } = new URL(request.url);
		const serverId = searchParams.get("serverId");

		if (!profile) return new NextResponse("Unauthorised User!", { status: 401 });
		if (!serverId) return new NextResponse("Missing Server ID!", { status: 400 });
		if (!params.channelId) return new NextResponse("Missing Channel ID!", { status: 400 });

		const server = await db.server.update({
			where: { id: serverId, members: { some: { profileId: profile.id, role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] } } } },
			data: { channels: { delete: { id: params.channelId, name: { not: "general" } } } },
		});

		return NextResponse.json(server);
	} catch (error) {
		console.log("[CHANNEL_ID_DELETE]", error);
		return new NextResponse("Internal server error!", { status: 500 });
	}
}

export async function PATCH(request: Request, { params }: { params: { channelId: string } }) {
	try {
		const profile = await currentProfile();
		const { name, type } = await request.json();
		const { searchParams } = new URL(request.url);
		const serverId = searchParams.get("serverId");

		if (!profile) return new NextResponse("Unauthorised User!", { status: 401 });
		if (!serverId) return new NextResponse("Missing Server ID!", { status: 400 });
		if (!params.channelId) return new NextResponse("Missing Channel ID!", { status: 400 });
		if (name === "General") return new NextResponse("Cannot rename channel to 'General'!", { status: 400 });

		const server = await db.server.update({
			where: { id: serverId, members: { some: { profileId: profile.id, role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] } } } },
			data: { channels: { update: { where: { id: params.channelId, NOT: { name: "general" } }, data: { name, type } } } },
		});

		return NextResponse.json(server);
	} catch (error) {
		console.log("[CHANNEL_ID_PATCH]", error);
		return new NextResponse("Internal server error!", { status: 500 });
	}
}
