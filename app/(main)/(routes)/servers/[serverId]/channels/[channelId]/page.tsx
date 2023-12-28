import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";
import { Fragment } from "react";

interface ChannelIdPageProps {
	params: {
		serverId: string;
		channelId: string;
	};
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
	const profile = await currentProfile();
	if (!profile) return redirectToSignIn();
	const channel = await db.channel.findUnique({ where: { id: params.channelId } });
	const member = await db.member.findFirst({ where: { profileId: profile.id, serverId: params.serverId } });
	if (!channel || !member) return redirect("/");
	const generalChannel = await db.channel.findFirst({ where: { name: "General" } });
	if (!generalChannel) return redirect("/");

	return (
		<div className="bg-white dark:bg-[#313338] flex flex-col h-full">
			<ChatHeader name={channel.name} serverId={channel.serverId} type="channel" />
			{channel.type === ChannelType.TEXT && (
				<Fragment>
					<ChatMessages
						member={member}
						name={channel.name}
						paramKey="channelId"
						paramValue={channel.id}
						chatId={channel.id}
						type="channel"
						apiUrl="/api/messages"
						socketUrl="/api/socket/messages"
						socketQuery={{ channelId: channel.id, serverId: channel.serverId }}
					/>
					<ChatInput name={channel.name} type="channel" apiUrl="/api/socket/messages" query={{ channelId: channel.id, serverId: channel.serverId }} />
				</Fragment>
			)}
			{channel.type === ChannelType.AUDIO && <MediaRoom chatId={channel.id} video={false} audio={true} params={{ serverId: params.serverId, channelId: generalChannel.id }} />}
			{channel.type === ChannelType.VIDEO && <MediaRoom chatId={channel.id} video={true} audio={true} params={{ serverId: params.serverId, channelId: generalChannel.id }} />}
		</div>
	);
};

export default ChannelIdPage;
