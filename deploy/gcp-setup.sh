#!/usr/bin/env bash
# One-time Google Cloud / Firebase setup for the GitHub deploy workflow.
#
# Prerequisites:
#   - A Google Cloud project with billing enabled (Blaze plan — Firebase Hosting needs it
#     to rewrite /api/** to Cloud Run) and Firebase added to it
#     (console.firebase.google.com → Add project → pick the existing GCP project).
#   - gcloud (logged in as a project Owner) and gh (logged in to GitHub).
#
# Usage:
#   PROJECT_ID=my-project ./deploy/gcp-setup.sh
# Optional: REGION (default europe-west1 — must match firebase.json), REPO
# (default EduardMiclos/evocati), BUCKET (default <project>-evocati-data).
#
# Safe to re-run: existing resources are kept.
set -euo pipefail

: "${PROJECT_ID:?Set PROJECT_ID}"
REGION="${REGION:-europe-west1}"
REPO="${REPO:-EduardMiclos/evocati}"
BUCKET="${BUCKET:-$PROJECT_ID-evocati-data}"
DEPLOY_SA="github-deployer@$PROJECT_ID.iam.gserviceaccount.com"
RUNTIME_SA="evocati-api@$PROJECT_ID.iam.gserviceaccount.com"

step() { printf '\n\033[1;33m▸ %s\033[0m\n' "$*"; }
exists() { "$@" >/dev/null 2>&1; }

gcloud config set project "$PROJECT_ID" >/dev/null
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"

step "Enabling APIs"
gcloud services enable \
  run.googleapis.com artifactregistry.googleapis.com storage.googleapis.com \
  iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  firebase.googleapis.com firebasehosting.googleapis.com cloudresourcemanager.googleapis.com

step "Artifact Registry repository for the API image"
exists gcloud artifacts repositories describe evocati --location "$REGION" ||
  gcloud artifacts repositories create evocati --repository-format docker --location "$REGION" \
    --description "Evocati API images"

step "Private bucket for admin data (texts, email settings, requests)"
exists gcloud storage buckets describe "gs://$BUCKET" ||
  gcloud storage buckets create "gs://$BUCKET" --location "$REGION" \
    --uniform-bucket-level-access --public-access-prevention
# Keep 30 days of overwritten/deleted versions, so an accidental change can be restored.
gcloud storage buckets update "gs://$BUCKET" --versioning
printf '%s' '{"rule":[{"action":{"type":"Delete"},"condition":{"daysSinceNoncurrentTime":30}}]}' > /tmp/evocati-lifecycle.json
gcloud storage buckets update "gs://$BUCKET" --lifecycle-file /tmp/evocati-lifecycle.json

step "Runtime service account (used by Cloud Run; can only touch the data bucket)"
exists gcloud iam service-accounts describe "$RUNTIME_SA" ||
  gcloud iam service-accounts create evocati-api --display-name "Evocati API runtime"
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" \
  --member "serviceAccount:$RUNTIME_SA" --role roles/storage.objectUser >/dev/null

step "Deploy service account (used by GitHub Actions)"
exists gcloud iam service-accounts describe "$DEPLOY_SA" ||
  gcloud iam service-accounts create github-deployer --display-name "GitHub Actions deployer"
for role in roles/run.admin roles/artifactregistry.writer roles/firebasehosting.admin roles/serviceusage.serviceUsageConsumer; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" --member "serviceAccount:$DEPLOY_SA" --role "$role" \
    --condition None >/dev/null
done
# Lets the deployer start Cloud Run with the runtime account (and nothing else).
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SA" \
  --member "serviceAccount:$DEPLOY_SA" --role roles/iam.serviceAccountUser >/dev/null

step "Workload Identity Federation (GitHub → Google, no keys)"
exists gcloud iam workload-identity-pools describe github --location global ||
  gcloud iam workload-identity-pools create github --location global --display-name "GitHub Actions"
exists gcloud iam workload-identity-pools providers describe github --location global --workload-identity-pool github ||
  gcloud iam workload-identity-pools providers create-oidc github \
    --location global --workload-identity-pool github \
    --issuer-uri "https://token.actions.githubusercontent.com" \
    --attribute-mapping "google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref" \
    --attribute-condition "assertion.repository == '$REPO'"
# Only this repository can act as the deployer.
gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SA" \
  --role roles/iam.workloadIdentityUser \
  --member "principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO" >/dev/null
WIF_PROVIDER="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github"

step "GitHub repository variables ($REPO)"
gh variable set GCP_PROJECT_ID --repo "$REPO" --body "$PROJECT_ID"
gh variable set GCP_REGION --repo "$REPO" --body "$REGION"
gh variable set GCP_WIF_PROVIDER --repo "$REPO" --body "$WIF_PROVIDER"
gh variable set GCP_DEPLOY_SA --repo "$REPO" --body "$DEPLOY_SA"
gh variable set GCP_RUNTIME_SA --repo "$REPO" --body "$RUNTIME_SA"
gh variable set GCP_DATA_BUCKET --repo "$REPO" --body "$BUCKET"

step "Done"
cat <<EOF
Next:
  1. GitHub → $REPO → Actions → "Deploy" → Run workflow (or push to main).
  2. Open https://$PROJECT_ID.web.app/#/admin and log in with the initial password.
  3. Firebase Console → Hosting → Add custom domain, for your own domain + free SSL.
EOF
