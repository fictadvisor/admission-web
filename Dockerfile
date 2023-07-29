FROM node:16-slim

WORKDIR /app
COPY . /app

RUN npm i
RUN npm run build

ENTRYPOINT ["npm", "run", "dev"]
