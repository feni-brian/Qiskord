import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs";
 
const uploadFunc = createUploadthing();
 
// Middleware to handle auth, throws error if not authenticated.
const handleAuth = () => {
    const { userId } = auth()
    // If you throw, the user will not be able to upload
    if (!userId) throw new Error("Unauthorized User!");
    return { userId };
}
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  serverImage: uploadFunc({ image: { maxFileSize: "4MB", maxFileCount: 1 } }).middleware(() => handleAuth()).onUploadComplete(() => {}),
  messageFile: uploadFunc(['image', 'pdf']).middleware(() => handleAuth()).onUploadComplete(() => {})
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
