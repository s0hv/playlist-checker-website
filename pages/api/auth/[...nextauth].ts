import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

export default NextAuth({
  providers: [
    DiscordProvider({
      clientId: <string>process.env.DISCORD_ID,
      clientSecret: <string>process.env.DISCORD_SECRET,
    }),
  ],
  callbacks: {
    jwt: async ({ token, profile}) => {
      if (profile) {
        token.id = (profile as any).id;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (token.id && session.user) {
        (<any>session.user).id = token.id;
      }
      return session;
    }
  },
  secret: process.env.AUTH_SECRET
});
