###################
# BUILD FOR PRODUCTION
###################

FROM node:16-slim as build

WORKDIR /app

COPY ./package.json ./

RUN npm i

###################
# PRODUCTION
###################

FROM node:16-slim as production

WORKDIR /app

COPY ./ /app
COPY --from=build /app/ /app/
RUN dir /app
RUN npm run build

CMD [ "npm", "run", "dev" ]
