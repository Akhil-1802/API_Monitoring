FROM oven/bun:1.1.0

WORKDIR /app

COPY bun.lock package.json ./
RUN bun install

COPY . .

EXPOSE 3000

CMD ["bun", "run", "start"]
