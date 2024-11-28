FROM node

# Set the working directory
RUN apt-get update && apt-get install -y default-mysql-client

WORKDIR /todo-notion

# Copy package.json and package-lock.json
# COPY ./prisma/*.prisma /app/prisma/
COPY package*.json ./

COPY .env ./
RUN cat .env

# Install dependencies
RUN npm install

# Copy the Prisma schema file to the container
COPY prisma/schema.prisma ./prisma/

# Generate the Prisma client
RUN npx prisma generate

# Salin folder src dan file lainnya
COPY src ./src

# Salin wait-for-it.sh (skrip untuk menunggu MySQL siap)
COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Expose the application port
EXPOSE 3040

# Start the server

CMD ["/wait-for-it.sh", "todo-notion-db:3306", "--", "npm", "src/server.js"]
