FROM node:18.14.2-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm cache clean --force
COPY . .
ENV PORT 80
EXPOSE 80
CMD ["node", "index.js"]