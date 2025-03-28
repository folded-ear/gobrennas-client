# build environment
FROM node:20 AS build
WORKDIR /app
COPY . ./
ENV NO_COLOR=true \
    CI=true
ARG SERVICE_NAME
RUN MODE="production" \
    && echo "Check if '$SERVICE_NAME' overrides mode" \
    && if echo "$SERVICE_NAME" | grep beta; then \
      MODE="beta"; \
    fi \
    && ./icons.sh --mode $MODE \
    && npm ci \
    && npx browserslist@latest --update-db \
    && npm run test \
    && npm run build -- --mode $MODE \
    && cp build/manifest.webmanifest build/manifest.json

# server environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/configfile.template

COPY --from=build /app/build /usr/share/nginx/html

ENV PORT=80 \
    HOST=0.0.0.0
EXPOSE $PORT
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
