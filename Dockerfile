FROM node:16
WORKDIR /app
COPY ./package.json /app/
RUN npm install && npm cache clean --force
COPY ./ /app
ENV PORT 80
EXPOSE 80
CMD [ "npm", "start" ]