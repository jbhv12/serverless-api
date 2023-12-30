FROM node:20
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
EXPOSE 3002
CMD ["sh", "-c", "npm run start-local"]
