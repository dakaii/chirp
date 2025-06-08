FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Install netcat for database connection check
RUN apk add --no-cache netcat-openbsd

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
