import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const sessionOptions = {
  cookieName: "exam_session",
  password:
    process.env.SESSION_SECRET ||
    "dev-only-insecure-session-secret-change-me-before-deploying-xx",
  cookieOptions: { secure: process.env.NODE_ENV === "production" },
};

// session shape: { userId, isAdmin }
export async function getSession() {
  return getIronSession(await cookies(), sessionOptions);
}
