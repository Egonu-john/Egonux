#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";
import { verifyManifest } from "./tirp-integrity.mjs";

function fail(message) { throw new Error(message); }

export function parseRecoveryArgs(argv) {
  const [command, ...tokens] = argv;
  if (command !== "verify") fail("Usage: tirp-recovery.mjs verify --root <backup-directory> --manifest <relative-manifest-path>");
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
  if (!options.root || !options.manifest) fail("verify requires --root and --manifest.");
  return { root: options.root, manifestPath: options.manifest };
}

export async function verifyRecoveryBundle(input) {
  const result = await verifyManifest(input);
  return { ...result, recoveryReady: true, restorationPerformed: false, destructiveActionsPerformed: false };
}

async function main() {
  const result = await verifyRecoveryBundle(parseRecoveryArgs(process.argv.slice(2)));
  process.stdout.write(`TIRP recovery bundle verified: ${result.fileCount} files.\n`);
  process.stdout.write("Read-only verification only: no restoration, overwrite, or deletion was performed.\n");
  process.stdout.write("A successful hash check does not authorize restoration; use the approved recovery procedure.\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { process.stderr.write(`TIRP recovery verification failed: ${error.message}\n`); process.exitCode = 1; });
}
