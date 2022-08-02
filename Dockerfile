FROM node:16.16.0-alpine

WORKDIR /app

ADD package.json .

RUN npm install
# ADD index.js ./
COPY . .

EXPOSE 3000

CMD [ "node", "server.mjs"]
