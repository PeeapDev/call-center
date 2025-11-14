FROM debian:stable-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        asterisk \
        asterisk-core-sounds-en \
        asterisk-moh-opsound-wav \
        curl \
        procps \
    && rm -rf /var/lib/apt/lists/*

# Copy Asterisk configuration
COPY conf/ /etc/asterisk/

# Expose SIP/HTTP/AMI and RTP
EXPOSE 5060/udp 5061/tcp 8088/tcp 5038/tcp 10000-10100/udp

# Run Asterisk in the foreground with verbose output
CMD ["/usr/sbin/asterisk", "-fvvv"]
