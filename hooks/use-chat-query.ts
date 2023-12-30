import { useSocket } from "@/components/providers/socket-provider";
import { QueryFunction, useInfiniteQuery } from "@tanstack/react-query";
import qs from "query-string";

interface ChatQueryProps {
	queryKey: string;
	apiUrl: string;
	paramKey: "channelId" | "conversationId";
	paramValue: string;
}

export const useChatQuery = ({ queryKey, apiUrl, paramKey, paramValue }: ChatQueryProps) => {
	const { isConnected } = useSocket();
	const fetchMessages = async ({ pageParam = undefined }) => {
		const url = qs.stringifyUrl({ url: apiUrl, query: { cursor: pageParam, [paramKey]: paramValue } }, { skipNull: true });
		const result = await fetch(url);
		return result.json();
	};
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
		queryKey: [queryKey],
		queryFn: () => fetchMessages({ pageParam: undefined }),
		initialPageParam: 0,
		getNextPageParam: (lastpage) => lastpage?.nextCursor,
		refetchInterval: isConnected ? false : 1000,
	});

	return { data, fetchNextPage, hasNextPage, isFetchingNextPage, status };
};

//: QueryFunction<any, string[], number>
