import { AtpAgent } from "@atproto/api";
import { fetchLyrics, fetchSongs, pickLyric } from "./lyrics";
import { Cron } from "croner";

const agent = new AtpAgent({
  service: "https://bsky.social",
});

async function skeet() {
  await agent.login({ identifier: process.env.BLUESKY_USERNAME!, password: process.env.BLUESKY_PASSWORD! });

  const songs = await fetchSongs();
  const song = songs[Math.floor(Math.random() * songs.length)];
  const lyrics = await fetchLyrics(song);
  const lyric = pickLyric(lyrics);

  await agent.post({ text: lyric });
}

const job = new Cron("*/10 * * * *", skeet);

job.trigger();