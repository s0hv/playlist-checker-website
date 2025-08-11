import { Discord } from 'arctic';
import { z } from 'zod';

export const discord = new Discord(process.env.DISCORD_ID!, process.env.DISCORD_SECRET!, process.env.OAUTH_REDIRECT!);

export const DiscordUser = z.object({
  id: z.string(),
});
export type DiscordUser = z.infer<typeof DiscordUser>;
