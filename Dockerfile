FROM mcr.microsoft.com/playwright:v1.61.1-noble

WORKDIR /app

COPY apps/test-runner-service/package*.json ./apps/test-runner-service/
RUN cd apps/test-runner-service && npm install

COPY apps/playwright-tests/package*.json ./apps/playwright-tests/
RUN cd apps/playwright-tests && npm install

COPY . .

WORKDIR /app/apps/test-runner-service

EXPOSE 4000

CMD ["npm", "start"]