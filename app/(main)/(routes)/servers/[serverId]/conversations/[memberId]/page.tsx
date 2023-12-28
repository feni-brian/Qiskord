import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/media-room";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Fragment } from "react";

interface MemberIdPageProps {
	params: {
		memberId: string;
		serverId: string;
	};
	searchParams: {
		video?: boolean;
	};
}

const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
	const profile = await currentProfile();
	if (!profile) return redirectToSignIn();
	const currentMember = await db.member.findFirst({ where: { id: params.memberId, serverId: params.serverId }, include: { profile: true } });
	if (!currentMember) return redirect("/");
	const conversation = await getOrCreateConversation(currentMember.id, params.memberId);
	if (!conversation) return redirect(`/servers/${params.serverId}`);
	const { memberOne, memberTwo } = conversation;
	const otherMember = memberOne.profileId === profile.id ? memberTwo : memberOne;
	const generalChannel = await db.channel.findFirst({ where: { name: "General" } });
	if (!generalChannel) return redirect("/");

	return (
		<div className="bg-white dark:bg-[#313338] flex flex-col h-full">
			<ChatHeader type="conversation" name={otherMember.profile.name} serverId={params.serverId} imageUrl={otherMember.profile.imageUrl} />
			{searchParams.video && <MediaRoom chatId={conversation.id} video={true} audio={true} params={{ serverId: params.serverId, channelId: generalChannel.id }} />}
			{!searchParams.video && (
				<Fragment>
					<ChatMessages
						member={currentMember}
						name={otherMember.profile.name}
						chatId={conversation.id}
						type="conversation"
						apiUrl="/api/direct-messages"
						paramKey="conversationId"
						paramValue={conversation.id}
						socketUrl="/api/socket/direct-messages"
						socketQuery={{ conversationId: conversation.id }}
					/>
					<ChatInput name={otherMember.profile.name} type="conversation" apiUrl="/api/socket/direct-messages" query={{ conversationId: conversation.id }} />
				</Fragment>
			)}
		</div>
	);
};

export default MemberIdPage;
