#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_PROJECT_NUMBER:?Set GCP_PROJECT_NUMBER}"
: "${VERCEL_TEAM_SLUG:?Set VERCEL_TEAM_SLUG}"
: "${VERCEL_PROJECT_NAME:?Set VERCEL_PROJECT_NAME}"

POOL_ID="egonux-vercel"
PROVIDER_ID="anosa-production"
SERVICE_ACCOUNT_ID="anosa-evidence"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_ID}@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
VERCEL_SUBJECT="owner:${VERCEL_TEAM_SLUG}:project:${VERCEL_PROJECT_NAME}:environment:production"

gcloud services enable firestore.googleapis.com iamcredentials.googleapis.com sts.googleapis.com --project="${GCP_PROJECT_ID}"
gcloud iam service-accounts create "${SERVICE_ACCOUNT_ID}" --display-name="ANOSA permanent evidence" --project="${GCP_PROJECT_ID}"
gcloud iam workload-identity-pools create "${POOL_ID}" --location=global --display-name="EGONUX Vercel" --project="${GCP_PROJECT_ID}"
gcloud iam workload-identity-pools providers create-oidc "${PROVIDER_ID}" \
  --location=global \
  --workload-identity-pool="${POOL_ID}" \
  --issuer-uri="https://oidc.vercel.com/${VERCEL_TEAM_SLUG}" \
  --allowed-audiences="https://vercel.com/${VERCEL_TEAM_SLUG}" \
  --attribute-mapping="google.subject=assertion.sub" \
  --attribute-condition="assertion.sub=='${VERCEL_SUBJECT}'" \
  --project="${GCP_PROJECT_ID}"

gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
  --role="roles/datastore.user"
gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT_EMAIL}" \
  --member="principal://iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/subject/${VERCEL_SUBJECT}" \
  --role="roles/iam.workloadIdentityUser" \
  --project="${GCP_PROJECT_ID}"

printf '%s\n' "GCP_WIF_AUDIENCE=//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"
printf '%s\n' "GCP_SERVICE_ACCOUNT_EMAIL=${SERVICE_ACCOUNT_EMAIL}"
