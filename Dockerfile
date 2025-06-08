FROM node:20-slim AS base
WORKDIR /usr/src/app
COPY package*.json ./

FROM base AS development
RUN apt-get update && apt-get install -y netcat-openbsd
RUN npm install
COPY . .

FROM base AS production
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-slim AS production-run
WORKDIR /usr/src/app
COPY --from=production /usr/src/app/dist ./dist
COPY --from=production /usr/src/app/node_modules ./node_modules
CMD ["node", "dist/main"]

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
