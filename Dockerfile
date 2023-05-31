FROM node:16-alpine as development

WORKDIR /app

COPY package*.json .

RUN npm i

COPY . .

EXPOSE 3000

CMD npm run start:dev