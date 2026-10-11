import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/mongodb";

/**
 * NextAuth Configuration Options
 * 
 * Supports both Google OAuth Provider and Credentials Provider.
 * Preserves roles, ensures Google users default to volunteer role without passwords,
 * and passes user ID, email, role, and avatar to JWT and session.
 */
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();

        // 1. Look up user in MongoDB
        const db = await getDatabase();
        const user = await db.collection("users").findOne({ email: normalizedEmail });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password.");
        }

        // 2. Compare password with stored bcrypt hash
        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordMatch) {
          throw new Error("Invalid email or password.");
        }

        // 3. Return user object (passed to jwt callback)
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role || "volunteer",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // Handle Google OAuth user registration or login
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const db = await getDatabase();
          const normalizedEmail = (user.email || "").trim().toLowerCase();

          // Check if user already exists
          const existingUser = await db.collection("users").findOne({ email: normalizedEmail });

          if (!existingUser) {
            // Create new volunteer user for first-time Google sign-in
            const newUser = {
              name: user.name || "Google User",
              email: normalizedEmail,
              image: user.image || null,
              role: "volunteer",
              provider: "google",
              createdAt: new Date(),
            };
            const result = await db.collection("users").insertOne(newUser);
            user.id = result.insertedId.toString();
            user.role = "volunteer";
          } else {
            // Preserve existing user role
            user.id = existingUser._id.toString();
            user.role = existingUser.role || "volunteer";
          }
          return true;
        } catch (error) {
          console.error("Error during Google OAuth sign in:", error);
          return false;
        }
      }
      return true;
    },

    // Store user ID, email, role, and avatar inside JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        if (user.image) {
          token.image = user.image;
        }
      }

      // Ensure MongoDB ID and role are present for all tokens
      if (!token.id || !token.role) {
        try {
          const db = await getDatabase();
          const dbUser = await db
            .collection("users")
            .findOne({ email: (token.email || "").toLowerCase() });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role || "volunteer";
            if (dbUser.image) {
              token.image = dbUser.image;
            }
          }
        } catch (err) {
          console.error("JWT user enrichment error:", err);
        }
      }

      return token;
    },

    // Expose role, ID, email, and avatar to client-side session.user
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role || "volunteer";
        session.user.name = token.name;
        session.user.email = token.email;
        if (token.image) {
          session.user.image = token.image;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
