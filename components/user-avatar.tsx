import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "./ui/avatar";

interface UserAvatarProps {
	srcProp?: string;
	classNameProp?: string;
}

export const UserAvatar = ({ srcProp, classNameProp }: UserAvatarProps) => {
	return (
		<Avatar className={cn("h-7 w-7 md:h-10 md:w-10", classNameProp)}>
			<AvatarImage src={srcProp} />
		</Avatar>
	);
};
