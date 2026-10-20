#!/usr/bin/env node
/**
 * EGONUX Trust Integrity & Recovery Protocol (TIRP)
 * Copyright (c) EGONUX WEALTH CENTRAL HUB. All rights reserved.
 *
 * This tool detects file drift against a trusted SHA-256 manifest.
 * A manifest is not an authentication mechanism by itself: store or sign the
 * expected manifest independently before relying on it as a trust anchor.
 */
import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, realpath, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SCHEMA_VERSION = 1;
const ALGORITHM = "sha256";
const DIGEST_PATTERN = /^[a-f0-9]{64}$/i;

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith("--")) fail(`Unexpected argument: ${token}`);
    const key = token.slice(2);
    if (key === "files") {
      options.files = rest.slice(i + 1);
      break;
    }
    const value = rest[i + 1];
    if (!value || value.startsWith("--")) fail(`Missing value for --${key}`);
    if (Object.hasOwn(options, key)) fail(`Duplicate option: --${key}`);
    options[key] = value;
    i += 1;
  }
  if (!["create", "verify"].includes(command)) {
    fail("Usage: tirp-integrity.mjs <create|verify> --root <dir> --output <file> --files <paths...> | --manifest <file>");
  }
  return { command, options };
}

function validateRelativePath(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    path.posix.isAbsolute(value) ||
    value === "." ||
    value.split("/").some((part) => part === ".." || part === "." || part === "")
  ) {
    fail(`Unsafe or non-canonical relative path: ${String(value)}`);
  }
  if (path.posix.normalize(value) !== value) fail(`Non-canonical relative path: ${value}`);
  return value;
}

async function resolveRegularFile(rootReal, relativePath) {
  validateRelativePath(relativePath);
  const absolute = path.resolve(rootReal, ...relativePath.split("/"));
  const relative = path.relative(rootReal, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) fail(`Path escapes the trusted root: ${relativePath}`);

  const info = await lstat(absolute).catch(() => null);
  if (!info) fail(`Required file does not exist: ${relativePath}`);
  if (!info.isFile() || info.isSymbolicLink()) fail(`Expected a regular, non-symlink file: ${relativePath}`);

  const resolved = await realpath(absolute);
  const resolvedRelative = path.relative(rootReal, resolved);
  if (resolvedRelative.startsWith("..") || path.isAbsolute(resolvedRelative)) {
    fail(`Resolved path escapes the trusted root: ${relativePath}`);
  }
  return resolved;
}

async function sha256File(filePath) {
  const bytes = await readFile(filePath);
  return createHash(ALGORITHM).update(bytes).digest("hex");
}

export async function createManifest({ root, output, files }) {
  if (!Array.isArray(files) || files.length === 0) fail("At least one file must be supplied.");
  const rootReal = await realpath(root);
  const outputRelative = validateRelativePath(output);
  const normalizedFiles = files.map(validateRelativePath);
  if (new Set(normalizedFiles).size !== normalizedFiles.length) fail("Duplicate file paths are not allowed.");
  if (normalizedFiles.includes(outputRelative)) fail("The manifest cannot include itself as an input file.");

  const entries = [];
  for (const file of [...normalizedFiles].sort()) {
    const resolved = await resolveRegularFile(rootReal, file);
    entries.push({ path: file, sha256: await sha256File(resolved) });
  }

  const manifest = {
    schemaVersion: SCHEMA_VERSION,
    algorithm: ALGORITHM,
    createdAt: new Date().toISOString(),
    sourceCommit: process.env.GITHUB_SHA || null,
    files: entries,
  };

  const outputAbsolute = path.resolve(rootReal, ...outputRelative.split("/"));
  const outputParent = path.dirname(outputAbsolute);
  await mkdir(outputParent, { recursive: true });
  const temporary = `${outputAbsolute}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx", mode: 0o600 });
  await rename(temporary, outputAbsolute);
  return manifest;
}

export async function verifyManifest({ root, manifestPath }) {
  const rootReal = await realpath(root);
  const manifestRelative = validateRelativePath(manifestPath);
  const resolvedManifest = await resolveRegularFile(rootReal, manifestRelative);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(resolvedManifest, "utf8"));
  } catch {
    fail("Manifest is not valid JSON.");
  }

  if (!manifest || manifest.schemaVersion !== SCHEMA_VERSION || manifest.algorithm !== ALGORITHM) {
    fail("Unsupported manifest schema or digest algorithm.");
  }
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) fail("Manifest has no file entries.");

  const seen = new Set();
  const failures = [];
  for (const entry of manifest.files) {
    if (!entry || typeof entry !== "object") fail("Manifest contains an invalid file entry.");
    const relativePath = validateRelativePath(entry.path);
    if (seen.has(relativePath)) fail(`Manifest contains duplicate path: ${relativePath}`);
    seen.add(relativePath);
    if (typeof entry.sha256 !== "string" || !DIGEST_PATTERN.test(entry.sha256)) {
      fail(`Invalid SHA-256 digest for ${relativePath}`);
    }

    try {
      const resolved = await resolveRegularFile(rootReal, relativePath);
      const actual = await sha256File(resolved);
      if (actual !== entry.sha256.toLowerCase()) {
        failures.push(`${relativePath}: digest mismatch (expected ${entry.sha256}, got ${actual})`);
      }
    } catch (error) {
      failures.push(`${relativePath}: ${error.message}`);
    }
  }

  if (failures.length > 0) fail(`Integrity verification failed:\n- ${failures.join("\n- ")}`);
  return { verified: true, fileCount: manifest.files.length, sourceCommit: manifest.sourceCommit ?? null };
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  const root = options.root || ".";
  if (command === "create") {
    if (!options.output || !options.files?.length) fail("create requires --output and --files <paths...>.");
    const manifest = await createManifest({ root, output: options.output, files: options.files });
    process.stdout.write(`TIRP manifest created: ${manifest.files.length} files; SHA-256.\n`);
    process.stdout.write("Reminder: independently protect or sign this manifest before treating it as a trust anchor.\n");
    return;
  }
  if (!options.manifest) fail("verify requires --manifest <file>.");
  const result = await verifyManifest({ root, manifestPath: options.manifest });
  process.stdout.write(`TIRP integrity verified: ${result.fileCount} files; SHA-256.\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`TIRP integrity failure: ${error.message}\n`);
    process.exitCode = 1;
  });
}
