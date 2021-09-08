#
#    88888888ba                                     88
#    88      "8b                                    88
#    88      ,8P                                    88
#    88aaaaaa8P'  8b,dPPYba,   ,adPPYba,    ,adPPYb,88
#    88""""""'    88P'   "Y8  a8"     "8a  a8"    `Y88
#    88           88          8b       d8  8b       88
#    88           88          "8a,   ,a8"  "8a,   ,d88
#    88           88           `"YbbdP"'    `"8bbdP"Y8
#
FROM node:14-slim as production

ARG PORT
ENV PORT=${PORT}

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./
RUN npm install; \
    npm audit fix --force; \
    npm ddp

COPY . .
RUN npm run maintenance; \
    npm run build

EXPOSE ${PORT}

CMD [ "node", "dist/main.js" ]

#
#    88888888ba,
#    88      `"8b
#    88        `8b
#    88         88   ,adPPYba,  8b       d8
#    88         88  a8P_____88  `8b     d8'
#    88         8P  8PP"""""""   `8b   d8'
#    88      .a8P   "8b,   ,aa    `8b,d8'
#    88888888Y"'     `"Ybbd8"'      "8"
#
FROM node:14-slim as development
