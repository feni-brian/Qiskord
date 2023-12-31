import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const room = request.nextUrl.searchParams.get("room");
	const username = request.nextUrl.searchParams.get("username");

	if (!room) {
		return NextResponse.json({ error: 'Missing "room" query parameter!' }, { status: 400 });
	} else if (!username) {
		return NextResponse.json({ error: 'Missing "username" query parameter!' }, { status: 400 });
	}

	const apikey = process.env.LIVEKIT_API_KEY;
	const apiSecret = process.env.LIVEKIT_API_SECRET;
	const webSocketUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

	if (!apikey || !apiSecret || !webSocketUrl) return NextResponse.json({ error: "Misconfigured LiveKit  Server!" }, { status: 500 });

	const token = new AccessToken(apikey, apiSecret, { identity: username });
	token.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

	return NextResponse.json({ token: token.toJwt() });
}
