FROM node:14-alpine

WORKDIR /app

# Using Docker layers here to avoid redownloading deps every code change
COPY package*.json /app/
RUN npm install

# Now we copy the rest, and do a Next.js build
COPY src tsconfig.json /app/
RUN npm run build

ENTRYPOINT ["npm", "run", "start"]
EXPOSE 3000