# AI

This repo contains an automation to extract uploaded ZIP archives into the repository root.

How to use
1. Add a ZIP file (preserving your folder hierarchy) to the uploads/ directory and push to the repository.
2. The workflow will run, validate and extract the ZIP contents into the repository root, and open a PR with the extracted files.
3. Review the PR and merge if everything looks good.

Notes
- The workflow enforces a 50 MB per-file limit by default.
- No custom blocked extensions are configured.
- The workflow prevents path traversal (zip-slip) and preserves folder structure when extracting.
