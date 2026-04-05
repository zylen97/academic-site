#!/bin/bash
VAULT_FILE="/Users/zylen/Library/CloudStorage/Dropbox/Apps/Zylen's Obsidian/02-working/1-科研&横向课题/研究项目索引.md"
DEST="src/data/projects.md"

if [ ! -f "$VAULT_FILE" ]; then
  echo "Error: Obsidian file not found at $VAULT_FILE"
  exit 1
fi

cp "$VAULT_FILE" "$DEST"
echo "Synced: $VAULT_FILE → $DEST"
