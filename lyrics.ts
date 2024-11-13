import parse from "node-html-parser";

// Minimal typings for the API results, we don't need most of it
type Song = {
  id: number;
  title: string;
  url: string;
  lyrics_state: "unreleased" | "complete";
};

const ARTIST_ID = 40035;

async function getch(url: string) {
  const res = await fetch(`https://api.genius.com/${url}`, {
    headers: { Authorization: `Bearer ${process.env.GENIUS_TOKEN}` },
  });
  return await res.json();
}

let SONG_CACHE: Song[] = [];

export async function fetchSongs() {
  if (SONG_CACHE.length) return SONG_CACHE;

  let page = 1;

  while (page) {
    const results = await getch(
      `artists/${ARTIST_ID}/songs?per_page=50&page=${page}`,
    );
    if (results.meta.status !== 200) break;
    const songs = results.response.songs.filter(
      (s: Song) => s.lyrics_state !== "unreleased",
    );
    SONG_CACHE.push(...songs);
    page = results.response.next_page;
  }

  return SONG_CACHE;
}

export async function fetchLyrics(song: Song) {
  const file = Bun.file(`./lyrics_cache/${song.id}.txt`);

  if (await file.exists()) return await file.text();

  switch (song.id) {
    // Kazoo Sonata in Cmaj
    case 2189699:
      return "[kazoo sounds]";
  }

  const response = await fetch(song.url);
  const page = await response.text();
  const root = parse(page.replaceAll("<br />", "\n"));
  const lyrics = root.querySelector(".lyrics,[class^=Lyrics__Container]")?.text;

  if (!lyrics) {
    console.error("No lyrics found for", song.id, `(${song.url})`);
    return "";
  }

  const formatted = lyrics
    .replaceAll(/\[.*?\]/g, "")
    .replaceAll(/\n{3,}/g, "\n\n")
    .trim();

  Bun.write(file, formatted);

  return formatted;
}

export function pickLyric(lyrics: string) {
  const sections = lyrics.split("\n\n");
  const section = sections[Math.floor(Math.random() * sections.length)];
  const lines = section.split("\n");
  const start = Math.floor(Math.random() * lines.length);
  const end =
    Math.floor(Math.random() * (lines.length - (start - 1))) + start + 1;
  return lines.slice(start, end).join("\n");
}
