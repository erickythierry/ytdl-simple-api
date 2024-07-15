FROM node:21-alpine3.18
WORKDIR /app
COPY package*.json ./
RUN apk update
RUN npm i
RUN npm cache clean --force
COPY . .
ENV PORT 80
EXPOSE 80
CMD ["node", "index.js"]