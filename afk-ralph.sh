#!/bin/bash
# AFK Ralph - Automated loop for batch processing
#
# Usage: ./afk-ralph.sh <iterations>
# Example: ./afk-ralph.sh 15
#
# For Docker sandbox: docker sandbox run claude ./afk-ralph.sh 15

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  echo "Example: $0 15"
  exit 1
fi

echo "Starting AFK Ralph with $1 iterations..."
echo "PRD: PRD.md"
echo "Progress: progress.txt"
echo "---"

for ((i=1; i<=$1; i++)); do
  echo ""
  echo "=== Iteration $i of $1 ==="
  echo ""

  result=$(claude --permission-mode acceptEdits -p "@PRD.md @progress.txt \
  1. Read the PRD and progress file. \
  2. Find the next incomplete task (first unchecked [ ] item). \
  3. Implement the fix following existing code patterns. \
  4. Run validation: pnpm run type-check && pnpm run build \
  5. Commit with format: fix(ONE-XX): Description \
  6. Push to main: git push origin main \
  7. Update progress.txt with what you did. \
  8. Check the [ ] item in PRD.md to mark it done. \
  9. Update Linear issue to Done using mcp__linear__update_issue. \
  ONLY WORK ON A SINGLE TASK. \
  If all tasks in PRD are complete, output <promise>COMPLETE</promise>.")

  echo "$result"

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo ""
    echo "=== PRD COMPLETE after $i iterations ==="
    exit 0
  fi
done

echo ""
echo "=== Reached max iterations ($1) ==="
echo "Run again to continue processing remaining tasks."
