FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install @nestjs/config

COPY . .

RUN mkdir -p src/config src/database/migrations

RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:dev"] 