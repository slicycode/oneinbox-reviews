#!/bin/bash
# Human-in-the-loop Ralph - Run once, watch, repeat
#
# Usage: ./ralph-once.sh
#
# This script runs Claude once to complete a single task from PRD.md.
# Watch what it does, review the commit, then run again.

claude --permission-mode acceptEdits "@PRD.md @progress.txt \
1. Read the PRD and progress file. \
2. Find the next incomplete task (first unchecked [ ] item). \
3. Implement the fix following existing code patterns. \
4. Run validation: pnpm run type-check && pnpm run build \
5. Commit with format: fix(ONE-XX): Description \
6. Update progress.txt with what you did. \
7. Update Linear issue to Done using mcp__linear__update_issue. \
ONLY DO ONE TASK AT A TIME."
