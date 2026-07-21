# SOW Builder

A local prototype for turning a solution deck into a draft statement of work.

## Run

```bash
PYTHONPATH=/Users/adrianchatto/.cache/codex-runtimes/codex-primary-runtime/dependencies/python \
/Users/adrianchatto/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 server.py
```

Open:

```text
http://127.0.0.1:5173
```

## What It Does

- Upload or paste source material from `.pptx`, `.pdf`, `.txt` or `.md` files.
- Presents recommended mandatory SOW sections as Include / Optional / Exclude choices.
- Seeds an Informa Stage 1 SOW draft from the supplied deck.
- Builds an editable plan-on-a-page timeline.
- Generates a printable/downloadable HTML SOW preview.
- Exports CloudInteract-branded `.docx` and `.pdf` drafts from the preview data.

## Current Notes

The supplied reference PDF is a mutual NDA, not a SOW. The app therefore treats NDA content as legal boilerplate prompts rather than automatically copying clauses into the SOW.

DOCX export uses the local CloudInteract Word template at:

```text
/Users/adrianchatto/Downloads/OneDrive_1_06-03-2026/CloudInteract_Template.docx
```
