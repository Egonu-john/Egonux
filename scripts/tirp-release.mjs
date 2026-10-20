#!/usr/bin/env node
import { lstat, realpath } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

function fail(message) { throw new Error(message); }

export function buildVerificationArgs({ artifact, repository, workflow, sourceRef }) {
  if (!artifact || !repository || !workflow || !sourceRef) fail("verify requires --artifact, --repo, --workflow and --source-ref.");
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) fail("Repository must be owner/name.");
  if (workflow.startsWith("/") || workflow.includes("..") || workflow.includes("\\")) fail("Unsafe signer workflow path.");
  if (!workflow.startsWith(".github/workflows/") || (!workflow.endsWith(".yml") && !workflow.endsWith(".yaml"))) fail("Signer workflow must be under .github/workflows/.");
  if (!/^refs\/(heads|tags)\/[A-Za-z0-9._\/-]+$/.test(sourceRef) || sourceRef.includes("..")) fail("Source ref must be refs/heads/... or refs/tags/...");
  return ["attestation", "verify", artifact, "--repo", repository, "--signer-workflow", `${repository}/${workflow}`, "--source-ref", sourceRef, "--format", "json"];
}

export async function verifyReleaseAttestation({ artifact, repository, workflow, sourceRef, run = spawnSync }) {
  const info = await lstat(artifact).catch(() => null);
  if (!info || !info.isFile() || info.isSymbolicLink()) fail("Artifact must be an existing regular, non-symlink file.");
  const absoluteArtifact = await realpath(artifact);
  const args = buildVerificationArgs({ artifact: absoluteArtifact, repository, workflow, sourceRef });
  const result = run("gh", args, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (result.error) fail(`GitHub CLI verification could not run: ${result.error.message}`);
  if (result.status !== 0) fail(`Release attestation verification failed (exit ${result.status}): ${String(result.stderr || result.stdout || "No verifier details returned.").trim()}`);
  let attestations;
  try { attestations = JSON.parse(result.stdout); } catch { fail("GitHub CLI returned invalid verification JSON."); }
  if (!Array.isArray(attestations) || attestations.length === 0) fail("No verified attestations were returned.");
  return { verified: true, artifact: path.basename(absoluteArtifact), repository, workflow, sourceRef, attestations: attestations.length };
}

function parseArgs(argv) {
  const [command, ...tokens] = argv;
  if (command !== "verify") fail("Usage: tirp-release.mjs verify --artifact <file> --repo <owner/name> --workflow <.github/workflows/file.yml> --source-ref <refs/heads/main|refs/tags/vX>");
  const options = {};
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token.startsWith("--")) fail(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    const value = tokens[i + 1];
    if (!value || value.startsWith("--")) fail(`Missing value for --${key}`);
    if (Object.hasOwn(options, key)) fail(`Duplicate option: --${key}`);
    options[key] = value; i += 1;
  }
  return { artifact: options.artifact, repository: options.repo, workflow: options.workflow, sourceRef: options["source-ref"] };
}

async function main() {
  const result = await verifyReleaseAttestation(parseArgs(process.argv.slice(2)));
  process.stdout.write(`TIRP release attestation verified: ${result.artifact}\nSigner: ${result.repository}/${result.workflow}\nSource: ${result.sourceRef}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { process.stderr.write(`TIRP release verification failed: ${error.message}\n`); process.exitCode = 1; });
}
