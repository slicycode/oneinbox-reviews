#!/bin/bash
# Wrapper to run ralph-orchestrator without plugin interception
exec /root/.nvm/versions/node/v22.14.0/bin/ralph "$@"
