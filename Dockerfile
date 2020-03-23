FROM node:13.8-alpine
RUN apk add bash
WORKDIR /node

CMD tail -f /dev/null