import parse from "node-html-parser";

const ARTIST_ID = 40035;
const CHARACTER_LIMIT = 300;

// Minimal typings for the API results, we don't need most of it
type Song = {
  id: number;
  title: string;
  url: string;
  lyrics_state: "unreleased" | "complete";
};

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

function takeWhile<T>(set: T[], predicate: (r: T[]) => boolean) {
  const result: T[] = [];
  for (let i = 0; i < set.length; i++) {
    // Roll to stop adding more elements (1/n chance to add)
    if (set.length / (set.length - i) < Math.random()) return result;

    // Add the element
    result.push(set[i]);

    // If adding this element fails the predicate, return without it.
    if (!predicate(result)) return result.slice(0, -1);
  }

  return result;
}

export function pickLyric(lyrics: string) {
  const sections = lyrics.split("\n\n");
  const sectionStart = Math.floor(Math.random() * sections.length);

  // Chance of just returning the whole section
  if (Math.random() < 0.25) {
    const result = takeWhile(
      sections.slice(sectionStart),
      (r) => r.join("\n\n").length <= CHARACTER_LIMIT,
    );
    if (result.length) return result.join("\n\n");
  }

  const section = sections[sectionStart];
  const lines = section.split("\n");
  const lineStart = Math.floor(Math.random() * lines.length);

  const result = takeWhile(
    lines.slice(lineStart),
    (r) => r.join("\n").length <= CHARACTER_LIMIT,
  );

  if (!result.length) return pickLyric(lyrics);

  return result.join("\n");
}
