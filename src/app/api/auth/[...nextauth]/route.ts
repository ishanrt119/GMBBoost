import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        
        // Find user
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user || !user.passwordHash) return null;

        // Check password
        const isMatch = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isMatch) return null;

        // Return token object
        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId?.toString(),
          activeBusinessId: user.activeBusinessId?.toString() || user.businessIds?.[0]?.toString(),
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.organizationId = (user as any).organizationId;
        token.activeBusinessId = (user as any).activeBusinessId;
      }
      
      // Update session when user switches businesses
      if (trigger === 'update' && session?.activeBusinessId) {
        token.activeBusinessId = session.activeBusinessId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).activeBusinessId = token.activeBusinessId;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
