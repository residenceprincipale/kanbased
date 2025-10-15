FROM oven/bun:1-alpine

COPY package.json ./
RUN bun install

COPY . .

EXPOSE 8000

CMD ["bun", "src/index.ts"]