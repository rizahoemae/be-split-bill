FROM node:18-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . . 
COPY runner.sh .
RUN chmod +x ./runner.sh
ENTRYPOINT ["./runner.sh"]
CMD [ "node", "app.js" ]
EXPOSE 3000
