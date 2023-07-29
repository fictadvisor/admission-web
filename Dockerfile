FROM node:18-slim

WORKDIR /app
COPY . /app

RUN npm i
RUN npm run build

ENTRYPOINT ["npm", "run", "dev"]
