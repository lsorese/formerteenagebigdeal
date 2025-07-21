# Claude Code Configuration

## Directory Access Rules

Claude should only access:
- Root-level files (package.json, README.md, etc.)
- The `/src/` directory and all its contents

Claude should ignore these directories completely:
- `/public/`
- `/dist/`
- `/node_modules/`
- Any other directories not explicitly allowed

## Tool Usage

When using search, glob, or file operations, exclude the ignored directories to maintain focus on source code and configuration files only.