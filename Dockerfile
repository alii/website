FROM oven/bun:1.2.22/slim as builder
WORKDIR /app

RUN bunx bun-pr 22504

COPY ./bunfig.toml /bunfig.toml
COPY ./package.json /package.json
RUN bun-22504 install

COPY . .
RUN bun-22504 build --app

FROM oven/bun:1.2.22/slim as runner
COPY --from=builder /app/dist /app

CMD ["bunx", "serve", "-s", "dist"]

