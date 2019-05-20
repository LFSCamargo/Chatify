# Download base image nodejs
FROM node:10.13.3 as build-env

COPY . /src

WORKDIR src

RUN npm install

FROM node:8.11.3-alpine as run time

COPY --from=build-env src/ src/

WORKDIR src

CMD ["npm", "start"]

# Set port and start service
EXPOSE 3000