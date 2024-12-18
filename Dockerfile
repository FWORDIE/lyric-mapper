FROM node:20 as build-app

ARG BUILD_TIME
ARG BUILD_VERSION
ARG BUILD_REVISION
WORKDIR /app
COPY . .
RUN npm install --force
RUN npm run build

FROM node:20-alpine as build-runtime

WORKDIR /app
COPY package.json ./
RUN npm install  --force

FROM node:20-alpine as final
ENV NODE_ENV production

WORKDIR /app
COPY --from=build-app /app/build ./build
COPY --from=build-runtime /app/package.json ./package.json
COPY --from=build-runtime /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "./build/index.js"]


