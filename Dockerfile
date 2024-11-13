# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun
COPY . .
RUN bun install --frozen-lockfile
ENTRYPOINT [ "bun", "run", "index.ts" ]