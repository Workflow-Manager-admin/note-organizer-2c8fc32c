#!/bin/bash
cd /home/kavia/workspace/code-generation/note-organizer-2c8fc32c/notes_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

