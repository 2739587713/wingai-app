import { readFileSync } from "fs";

// Test uploading a preset avatar to tmpfiles.org
const file = readFileSync("public/avatars/p1.png");
const form = new FormData();
form.append("file", new Blob([file], { type: "image/png" }), "avatar.png");

const r = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
console.log("Status:", r.status);
const j = await r.json();
console.log("Response:", JSON.stringify(j));
if (j.data?.url) {
  const dlUrl = j.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
  console.log("Download URL:", dlUrl);
  // Verify it's accessible
  const check = await fetch(dlUrl, { method: "HEAD" });
  console.log("Check status:", check.status, "Content-Type:", check.headers.get("content-type"));
}
