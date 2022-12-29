FROM node:current-alpine
WORKDIR /app
COPY ./ /app
RUN npm install
RUN npm install pm2 -g
ENV PORT 80
EXPOSE 80
CMD ["pm2-runtime", "pm2.json"]