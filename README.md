# bluesky-lyricbot

## Usage

This package is deployed as a docker image on GHCR

```shell
docker pull ghcr.io/gausie/bluesky-lyricbot
```

You will need to provide some environment variables for the bot to work, see `.env.example` for more information.

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
