FROM node:21-alpine
WORKDIR /app
COPY package*.json ./
RUN npm i
RUN npm cache clean --force
COPY . .
ENV PORT 80
EXPOSE 80
CMD ["node", "index.js"]