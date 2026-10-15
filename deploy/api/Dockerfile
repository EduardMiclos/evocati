# PHP API (public/api) for Cloud Run. Firebase Hosting serves the static site and
# rewrites /api/** to this container. Build from the repository root:
#   docker build -f deploy/api/Dockerfile -t evocati-api .
FROM php:8.3-apache

# Cloud Run sends requests to $PORT (8080 by default).
ENV PORT=8080

RUN sed -ri 's/^Listen 80$/Listen ${PORT}/' /etc/apache2/ports.conf \
 && sed -ri 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/' /etc/apache2/sites-available/000-default.conf \
 && a2enmod headers \
 && printf '%s\n' \
      'ServerName localhost' \
      'ServerTokens Prod' \
      'ServerSignature Off' \
      '<Directory /var/www/html>' \
      '  Options -Indexes' \
      '  AllowOverride All' \
      '</Directory>' \
      > /etc/apache2/conf-enabled/evocati.conf \
 && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
 && printf '%s\n' 'expose_php = Off' 'session.use_strict_mode = 1' > "$PHP_INI_DIR/conf.d/evocati.ini"

COPY public/api/ /var/www/html/api/

# Runtime data lives on the Cloud Storage volume mounted at /data (see deploy.yml),
# never inside the image.
RUN rm -rf /var/www/html/api/data && chown -R root:root /var/www/html && chmod -R a+rX /var/www/html

ENV EVOCATI_PLATFORM=firebase \
    EVOCATI_SESSION_NAME=__session \
    EVOCATI_TRUST_PROXY=1 \
    EVOCATI_DATA_DIR=/data \
    EVOCATI_SESSION_DIR=/data/sessions
