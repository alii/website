FROM oven/bun:1.2.22 as builder
WORKDIR /app

RUN apt update && apt install -y unzip
RUN bunx bun-pr 4f0d2a5624e4c54eb89faf7d5e23470efc8de667
COPY bunfig.toml bunfig.toml
COPY bun.lock bun.lock
COPY package.json package.json
RUN bun-4f0d2a5624e4c54eb89faf7d5e23470efc8de667 install

COPY . .
RUN bun-4f0d2a5624e4c54eb89faf7d5e23470efc8de667 build --app

FROM oven/bun:1.2.22 as runner
COPY --from=builder /app/dist /app

EXPOSE 3000
CMD ["bunx", "serve", "dist", "-l", "http://0.0.0.0:3000", "-s"]
