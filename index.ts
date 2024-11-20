import { AtpAgent } from "@atproto/api";
import { Cron } from "croner";
import prettyMilliseconds from "pretty-ms";

import { fetchLyrics, fetchSongs, pickLyric } from "./lyrics";
import { config } from "./config";

const agent = new AtpAgent({
  service: "https://bsky.social",
});

async function skeet() {
  await agent.login({
    identifier: config.BLUESKY_USERNAME,
    password: config.BLUESKY_PASSWORD,
  });

  const songs = await fetchSongs();
  const song = songs[Math.floor(Math.random() * songs.length)];
  const lyrics = await fetchLyrics(song);
  const lyric = pickLyric(lyrics);
  console.log(`Posting lyric from "${song.title}" (${song.url})`);

  await agent.post({ text: lyric });
}

const job = new Cron("0 * * * *", skeet);

const ms = job.msToNext();

if (!ms) {
  console.error("Started, but no job is scheduled for some reason");
} else {
  console.log("Started,", prettyMilliseconds(ms), "to next post");
}
