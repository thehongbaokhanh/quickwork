FROM alpine:3.22

RUN apk add --no-cache ca-certificates mariadb-client restic tar tzdata

COPY backup.sh /usr/local/bin/quickwork-backup
RUN chmod 0555 /usr/local/bin/quickwork-backup

USER 65534:65534
ENTRYPOINT ["/usr/local/bin/quickwork-backup"]
