FROM node:20.11.1-alpine AS builder
ARG COMMIT_MESSAGE
ARG COMMIT_INITIATOR
ARG COMMIT_DATE
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html/testovoe
EXPOSE 80