#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_SERVICE_ACCOUNT_EMAIL:?Set GCP_SERVICE_ACCOUNT_EMAIL}"

LOCATION="global"
KEY_RING="anosa-evidence"
KEY_NAME="receipt-signing"

gcloud services enable cloudkms.googleapis.com --project="${GCP_PROJECT_ID}"
gcloud kms keyrings describe "${KEY_RING}" --location="${LOCATION}" --project="${GCP_PROJECT_ID}" >/dev/null 2>&1 \
  || gcloud kms keyrings create "${KEY_RING}" --location="${LOCATION}" --project="${GCP_PROJECT_ID}"
gcloud kms keys describe "${KEY_NAME}" --keyring="${KEY_RING}" --location="${LOCATION}" --project="${GCP_PROJECT_ID}" >/dev/null 2>&1 \
  || gcloud kms keys create "${KEY_NAME}" --keyring="${KEY_RING}" --location="${LOCATION}" --purpose="asymmetric-signing" --default-algorithm="ec-sign-p256-sha256" --protection-level="software" --project="${GCP_PROJECT_ID}"
gcloud kms keys add-iam-policy-binding "${KEY_NAME}" \
  --keyring="${KEY_RING}" --location="${LOCATION}" --project="${GCP_PROJECT_ID}" \
  --member="serviceAccount:${GCP_SERVICE_ACCOUNT_EMAIL}" --role="roles/cloudkms.signerVerifier"

KEY_VERSION="projects/${GCP_PROJECT_ID}/locations/${LOCATION}/keyRings/${KEY_RING}/cryptoKeys/${KEY_NAME}/cryptoKeyVersions/1"
printf '%s\n' "ANOSA_KMS_KEY_VERSION=${KEY_VERSION}"
printf '%s\n' "ANOSA_KMS_SIGNING_ENABLED=true"
