# syntax=docker/dockerfile:1.7

FROM golang:1.26.7-alpine AS build

WORKDIR /src

RUN apk add --no-cache ca-certificates git tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN mkdir -p /out \
    && CGO_ENABLED=0 GOOS=linux go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /out/quickwork-api \
    ./cmd/api

FROM alpine:3.24 AS runtime

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S quickwork \
    && adduser -S -G quickwork quickwork

WORKDIR /app

COPY --from=build /out/quickwork-api ./quickwork-api

RUN mkdir -p /app/uploads \
    && chown -R quickwork:quickwork /app

USER quickwork

EXPOSE 8080

CMD ["./quickwork-api"]
