FROM node:22 AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm run build


EXPOSE 4173
ENTRYPOINT ["pnpm"]
CMD ["run", "preview", "--host"]

