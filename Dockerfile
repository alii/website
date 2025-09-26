FROM oven/bun:1.2.22 as builder
WORKDIR /app

RUN apt update && apt install -y unzip
RUN bunx bun-pr 22504
COPY bunfig.toml bunfig.toml
COPY bun.lock bun.lock
COPY package.json package.json
RUN bun-22504 install

COPY . .
RUN bun-22504 build --app

FROM oven/bun:1.2.22 as runner
COPY --from=builder /app/dist /app

CMD ["bunx", "serve", "-s", "dist"]
