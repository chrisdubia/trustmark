// Safe wrapper around Clerk auth — returns null if Clerk is not configured
export async function getCurrentUserId(): Promise<string | null> {
  const configured =
    process.env.CLERK_SECRET_KEY &&
    process.env.CLERK_SECRET_KEY !== "placeholder";

  if (!configured) return null;

  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}
