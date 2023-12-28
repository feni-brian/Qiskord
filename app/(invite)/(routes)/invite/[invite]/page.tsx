import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface InvitePageProps {
	params: {
		invite: string;
	};
}

const InvitePage = async ({ params }: InvitePageProps) => {
	const profile = await currentProfile();
	if (!profile) return redirectToSignIn();
	if (!params.invite) return redirect("/");
	const existingServer = await db.server.findFirst({ where: { invite: params.invite, members: { some: { profileId: profile.id } } } });
	if (existingServer) return redirect(`/servers/${existingServer.id}`);
	const server = await db.server.update({ where: { invite: params.invite }, data: { members: { create: [{ profileId: profile.id }] } } });
	if (server) return redirect(`/servers/${server.id}`);

	return null;
};

export default InvitePage;
