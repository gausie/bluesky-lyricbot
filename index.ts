import { AtpAgent } from "@atproto/api";
import { fetchLyrics, fetchSongs, pickLyric } from "./lyrics";
import { Cron } from "croner";

declare module "bun" {
  interface Env {
    BLUESKY_USERNAME: string;
    BLUESKY_PASSWORD: string;
    GENIUS_ARTIST_ID: string;
    GENIUS_TOKEN: string;
  }
}

const agent = new AtpAgent({
  service: "https://bsky.social",
});

async function skeet() {
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME,
    password: process.env.BLUESKY_PASSWORD,
  });

  const songs = await fetchSongs();
  const song = songs[Math.floor(Math.random() * songs.length)];
  const lyrics = await fetchLyrics(song);
  const lyric = pickLyric(lyrics);
  console.log(`Posting lyric from "${song.title}" (${song.url})`);

  await agent.post({ text: lyric });
}

const job = new Cron("0 * * * *", skeet);

console.log("Started,", job.msToNext(), "ms to next post");
