FROM nginx:alpine

RUN mkdir -p /etc/ssl/private /etc/ssl/certs

RUN apk add --no-cache openssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/self.key \
    -out /etc/ssl/certs/self.crt \
    -subj "/C=ES/ST=Malaga/L=Malaga/O=42/OU=Student/CN=localhost"

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443
EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]