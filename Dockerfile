FROM node:16
WORKDIR /app
COPY ./package.json /app/
RUN npm install && npm cache clean --force
COPY ./ /app
ENV PORT 8080
EXPOSE 8080
CMD [ "npm", "start" ]