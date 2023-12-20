import { ThemeProvider } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Qiskord",
	description: "Discord Clone Created by Feni Brian",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<body className={cn(inter.className, "bg-white dark:bg-[#313338]")}>
					<ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="discord-theme">
						{children}
					</ThemeProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
