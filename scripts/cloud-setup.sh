#!/bin/bash
# Installs tools the cloud VM lacks. Does nothing on a laptop.
[ "$CLAUDE_CODE_REMOTE" = "true" ] || exit 0

if ! command -v ffmpeg >/dev/null 2>&1; then
  (apt-get update -qq && apt-get install -y -qq ffmpeg) >/dev/null 2>&1 \
    || echo "cloud-setup: ffmpeg install failed, video-editing cannot render" >&2
fi
exit 0
