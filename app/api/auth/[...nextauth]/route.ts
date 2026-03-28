import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

console.log('[nextauth] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "https://campus-oss.vercel.app";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };