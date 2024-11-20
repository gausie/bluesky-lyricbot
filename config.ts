import { z } from "zod";

const schema = z.object({
  BLUESKY_USERNAME: z.string(),
  BLUESKY_PASSWORD: z.string(),
  GENIUS_ARTIST_ID: z.coerce.number().int(),
  GENIUS_TOKEN: z.string(),
});

declare module "bun" {
  interface Env extends z.infer<typeof schema> {}
}

export const config = schema.parse(process.env);
