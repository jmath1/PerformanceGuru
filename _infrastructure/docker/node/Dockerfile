# create a dockerfile for my server.js node application
FROM node:18
# Set the working directory
WORKDIR /usr/src/app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application code
COPY server.js ./
# Expose the port the app runs on
EXPOSE 3001
# Command to run the application
CMD ["node", "server.js"]