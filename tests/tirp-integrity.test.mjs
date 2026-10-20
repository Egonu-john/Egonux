import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createManifest, verifyManifest } from "../scripts/tirp-integrity.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "egonux-tirp-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "src"));
  await writeFile(path.join(root, "src", "safe.txt"), "approved release\n");
  await writeFile(path.join(root, "README.md"), "EGONUX TIRP test fixture\n");
  return root;
}

async function create(root, files = ["src/safe.txt", "README.md"]) {
  return createManifest({ root, output: ".tirp/manifest.json", files });
}

test("creates and verifies a sorted SHA-256 manifest", async (t) => {
  const root = await fixture(t);
  const manifest = await create(root);
  assert.deepEqual(manifest.files.map((entry) => entry.path), ["README.md", "src/safe.txt"]);
  assert.equal((await verifyManifest({ root, manifestPath: ".tirp/manifest.json" })).verified, true);
});

test("rejects a modified file", async (t) => {
  const root = await fixture(t);
  await create(root);
  await writeFile(path.join(root, "src", "safe.txt"), "unauthorized change\n");
  await assert.rejects(
    verifyManifest({ root, manifestPath: ".tirp/manifest.json" }),
    /Integrity verification failed.*digest mismatch/s,
  );
});

test("rejects a missing protected file", async (t) => {
  const root = await fixture(t);
  await create(root);
  await rm(path.join(root, "src", "safe.txt"));
  await assert.rejects(
    verifyManifest({ root, manifestPath: ".tirp/manifest.json" }),
    /Integrity verification failed.*does not exist/s,
  );
});

test("rejects path traversal", async (t) => {
  const root = await fixture(t);
  await assert.rejects(createManifest({ root, output: ".tirp/manifest.json", files: ["../outside.txt"] }), /Unsafe|non-canonical/);
});

test("rejects duplicate input paths", async (t) => {
  const root = await fixture(t);
  await assert.rejects(create(root, ["README.md", "README.md"]), /Duplicate file paths/);
});

test("rejects symlinked protected files", async (t) => {
  const root = await fixture(t);
  await writeFile(path.join(root, "outside.txt"), "outside root");
  await symlink(path.join(root, "outside.txt"), path.join(root, "src", "linked.txt"));
  await assert.rejects(create(root, ["src/linked.txt"]), /regular, non-symlink/);
});

test("rejects unsupported or malformed manifests", async (t) => {
  const root = await fixture(t);
  await mkdir(path.join(root, ".tirp"));
  await writeFile(path.join(root, ".tirp", "bad.json"), JSON.stringify({ schemaVersion: 99, algorithm: "md5", files: [] }));
  await assert.rejects(verifyManifest({ root, manifestPath: ".tirp/bad.json" }), /Unsupported manifest schema/);
});

test("rejects tampered manifest paths", async (t) => {
  const root = await fixture(t);
  await create(root);
  const manifestPath = path.join(root, ".tirp", "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.files[0].path = "../../etc/passwd";
  await writeFile(manifestPath, JSON.stringify(manifest));
  await assert.rejects(verifyManifest({ root, manifestPath: ".tirp/manifest.json" }), /Unsafe|non-canonical/);
});
