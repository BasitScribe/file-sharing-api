FROM node:18-alpine
WORKDIR /usr/src/app

#deps
COPY package*.json ./
RUN npm ci --production

#copy
COPY . .

# expose
EXPOSE 4000
ENV NODE_ENV=production

CMD ["node", "server.js"]