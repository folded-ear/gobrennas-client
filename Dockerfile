# build environment
FROM node:20 as build
WORKDIR /app
COPY . ./
ENV CI=true
ARG SERVICE_NAME
RUN if echo "$SERVICE_NAME" | grep beta; then \
      ./icons.sh --beta; \
    fi
RUN npm ci
RUN npx browserslist@latest --update-db
RUN npm run test
RUN npm run build

# server environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/configfile.template

COPY --from=build /app/build /usr/share/nginx/html

ENV PORT=80 \
    HOST=0.0.0.0
EXPOSE $PORT
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
