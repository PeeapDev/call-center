FROM andrius/asterisk:latest

# Copy Asterisk configuration
COPY conf/ /etc/asterisk/

# Expose SIP/HTTP/AMI/WebSocket and RTP
EXPOSE 5060/udp 5061/tcp 8088/tcp 8089/tcp 5038/tcp 10000-10100/udp

# Run Asterisk in the foreground with verbose output
CMD ["asterisk", "-fvvv"]
