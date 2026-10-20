import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildVerificationArgs } from "../scripts/tirp-release.mjs";
import { verifyRecoveryBundle } from "../scripts/tirp-recovery.mjs";
import { createManifest } from "../scripts/tirp-integrity.mjs";

test("release verification pins repository, signer workflow, and source ref", () => {
  assert.deepEqual(buildVerificationArgs({
    artifact: "/tmp/source.tar.gz",
    repository: "Egonu-john/Egonux",
    workflow: ".github/workflows/ci.yml",
    sourceRef: "refs/heads/main",
  }), [
    "attestation", "verify", "/tmp/source.tar.gz",
    "--repo", "Egonu-john/Egonux",
    "--signer-workflow", "Egonu-john/Egonux/.github/workflows/ci.yml",
    "--source-ref", "refs/heads/main",
    "--format", "json",
  ]);
});

test("release verification rejects unsafe signer path and broad source ref", () => {
  assert.throws(() => buildVerificationArgs({
    artifact: "artifact.tgz", repository: "Egonu-john/Egonux",
    workflow: "../untrusted.yml", sourceRef: "refs/heads/main",
  }), /workflow path/i);
  assert.throws(() => buildVerificationArgs({
    artifact: "artifact.tgz", repository: "Egonu-john/Egonux",
    workflow: ".github/workflows/ci.yml", sourceRef: "main",
  }), /source ref/i);
});

test("recovery bundle validation is read-only and detects changed files", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "egonux-recovery-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "backup"));
  await writeFile(path.join(root, "backup", "records.json"), '{"recovery":"fixture"}\n');
  await createManifest({ root, output: "backup/manifest.json", files: ["backup/records.json"] });
  const valid = await verifyRecoveryBundle({ root, manifestPath: "backup/manifest.json" });
  assert.equal(valid.recoveryReady, true);
  assert.equal(valid.restorationPerformed, false);
  assert.equal(valid.destructiveActionsPerformed, false);
  await writeFile(path.join(root, "backup", "records.json"), '{"recovery":"tampered"}\n');
  await assert.rejects(verifyRecoveryBundle({ root, manifestPath: "backup/manifest.json" }), /Integrity verification failed.*digest mismatch/s);
});
