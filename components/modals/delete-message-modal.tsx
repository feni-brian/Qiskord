"use client";

import { useModalStore } from "@/hooks/use-modal-store";
import axios from "axios";
import qs from "query-string";
import { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

export const DeleteMessageModal = () => {
	const { isOpen, onClose, type, data } = useModalStore();
	const isModalOpen = isOpen && type === "deleteMessage";
	const { apiUrl, query } = data;
	const [isLoading, setIsLoading] = useState(false);
	const onClick = async () => {
		try {
			setIsLoading(true);
			const url = qs.stringifyUrl({ url: apiUrl || "", query });
			await axios.delete(url);
			onClose();
		} catch (error) {
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isModalOpen} onOpenChange={onClose}>
			<DialogContent className="bg-white text-black p-0 overflow-hidden">
				<DialogHeader className="pt-8 px-6">
					<DialogTitle className="text-2xl text-center font-bold">Delete Message</DialogTitle>
					<DialogDescription className="text-center text-zinc-500">
						Are you sure you want to delete this message? This action cannot be undone. <br />
						This message will be permanently deleted.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter className="bg-gray-100 px-6 py-4">
					<div className="flex items-center justify-between w-full">
						<Button variant="ghost" disabled={isLoading} onClick={onClose}>
							Cancel
						</Button>
						<Button variant="primary" disabled={isLoading} onClick={onClick}>
							Confirm
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
