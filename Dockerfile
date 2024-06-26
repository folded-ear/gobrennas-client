# build environment
FROM node:20 as build
WORKDIR /app
COPY . ./
ENV NO_COLOR=true \
    CI=true
ARG SERVICE_NAME
RUN echo "Check if '$SERVICE_NAME' requires icon regen" \
    && if echo "$SERVICE_NAME" | grep beta; then \
      ./icons.sh --beta; \
    fi \
    && npm ci \
    && npx browserslist@latest --update-db \
    && npm run test \
    && npm run build

# server environment
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/configfile.template

COPY --from=build /app/build /usr/share/nginx/html

ENV PORT=80 \
    HOST=0.0.0.0
EXPOSE $PORT
CMD sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/configfile.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
