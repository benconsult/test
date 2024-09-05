
FROM node:latest

#Creating a new directory for app files and setting path in the container
RUN mkdir -p /usr/src/app


WORKDIR /usr/src/app

COPY package.json /usr/src/app

# installing the dependencies into the container
RUN npm install

#copying the source code of Application into the container dir
COPY . /usr/src/app

#container exposed network port number
EXPOSE 3000


CMD ["node", "app.js"]
