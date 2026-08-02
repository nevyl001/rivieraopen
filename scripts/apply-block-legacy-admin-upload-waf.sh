#!/usr/bin/env bash
# Apply emergency WAF deny for the retired proxied upload endpoint.
# Run from a shell authenticated to team nevyl001s-projects / project rivieraopen.
set -euo pipefail

npx vercel firewall rules add "block-legacy-admin-upload" \
  --project rivieraopen \
  --condition '{"type":"path","op":"eq","value":"/api/admin/upload"}' \
  --action deny \
  --description "Emergency deny: stop abuse of proxied multipart uploads (incoming FDT)" \
  --yes

npx vercel firewall publish --project rivieraopen --yes

npx vercel firewall rules list --project rivieraopen
