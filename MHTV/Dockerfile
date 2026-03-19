FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json tsconfig.json ./
RUN npm install

COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist
COPY src/ui/assets ./src/ui/assets
COPY src/db ./src/db

EXPOSE 7000
CMD ["node", "dist/index.js"]
