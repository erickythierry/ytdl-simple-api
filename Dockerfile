FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN apk update && apk add --no-cache ffmpeg git
RUN npm install
RUN npm cache clean --force
COPY . .
ENV PORT 80
EXPOSE 80
CMD ["node", "index.js"]