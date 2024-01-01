FROM node:20
WORKDIR /app
COPY app/package*.json ./
RUN npm install
COPY app .
EXPOSE 3001
EXPOSE 3002
EXPOSE 3003
EXPOSE 3004
CMD ["sh", "-c", "npm run start-local"]
