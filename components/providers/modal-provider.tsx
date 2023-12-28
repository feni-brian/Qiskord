"use client";

import { Fragment, useEffect, useState } from "react";
import { CreateServerModal } from "../modals/create-server-modal";
import { EditServerModal } from "../modals/edit-server-modal";
import { InviteServerModal } from "../modals/invite-server-modal";
import { LeaveServerModal } from "../modals/leave-server-modal";
import { CreateChannelModal } from "../modals/create-channel-modal";
import { DeleteServerModal } from "../modals/delete-server-modal";
import { EditChannelModal } from "../modals/edit-channel-modal";
import { DeleteChannelModal } from "../modals/delete-channel-modal";
import { MembersModal } from "../modals/members-modal";
import { MessageFileModal } from "../modals/message-file-modal";
import { DeleteMessageModal } from "../modals/delete-message-modal";

export const ModalProvider = () => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);
    
	if (!isMounted) return null;

	return (
		<Fragment>
			<CreateServerModal />
			<InviteServerModal />
			<EditServerModal />
			<LeaveServerModal />
			<DeleteServerModal />
			<CreateChannelModal />
			<EditChannelModal />
			<DeleteChannelModal />
			<MembersModal />
			<MessageFileModal />
			<DeleteMessageModal />
		</Fragment>
	);
};
