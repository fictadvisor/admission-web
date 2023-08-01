#FROM node:16-slim
#
#WORKDIR /app
#COPY . /app
#
#RUN npm i
#RUN npm run build
#
#ENV PORT=4040
#ENV NEXT_PUBLIC_QUEUE_API=https://apidev.fictadvisor.com/v2
#
#ENTRYPOINT ["npm", "run", "dev"]

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

ENV PORT=4040
ENV NEXT_PUBLIC_QUEUE_API=http://localhost:4455/v2

CMD [ "npm", "run", "dev" ]
