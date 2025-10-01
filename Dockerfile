# Stage 1: Build the React application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
# and install dependencies
COPY package.json /app/
# Uncomment the line below if you use yarn instead of npm
# COPY yarn.lock /app/
RUN npm install
# If using yarn, use:
# RUN yarn install

# Copy the rest of the application source code
COPY . /app

# Build the application for production
# This command generates the static assets in the 'build' folder (default for Create React App)
RUN npm run build
# If using yarn, use:
# RUN yarn build

# --------------------------------------------------------------------------------

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine AS production-stage

# Remove the default Nginx configuration
RUN rm -rf /etc/nginx/conf.d

# Copy a custom Nginx configuration file
# (See the note below on creating a 'nginx.conf' file)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static build files from the 'builder' stage into the Nginx public directory
# The 'build' folder is the output directory of 'npm run build'
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# The default Nginx command starts the server
CMD ["nginx", "-g", "daemon off;"]
