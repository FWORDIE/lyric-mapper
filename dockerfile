FROM node:22 AS builder
WORKDIR /app
COPY package*.json .
RUN npm i --force
COPY . .
ARG KEY=${KEY}
RUN npm run build
RUN npm prune --production --force

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "build" ]