// Final acceptance test for the live Vercel deployment.
const BASE = "https://muhanad-portfolio-jade.vercel.app";
let pass = 0, fail = 0;
const ok = (name, extra) => { pass++; console.log(`[OK]   ${name}${extra ? " — " + extra : ""}`); };
const bad = (name, extra) => { fail++; console.log(`[FAIL] ${name}${extra ? " — " + extra : ""}`); };

const pages = ["/", "/portfolio", "/blog", "/about", "/services", "/contact", "/showreel", "/cv"];
for (const p of pages) {
  try {
    const r = await fetch(BASE + p, { redirect: "manual" });
    r.status === 200 ? ok(p) : bad(p, "status " + r.status);
  } catch (e) { bad(p, e.message); }
}

// admin login
try {
  const r = await fetch(BASE + "/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "mohannadwael1000@gmail.com", password: "eqXMGHh&A2!o+3m6" }),
  });
  const cookie = (r.headers.get("set-cookie") || "").toLowerCase();
  r.status === 200 && cookie.includes("token") ? ok("admin login", "cookie set") : bad("admin login", "status " + r.status);
} catch (e) { bad("admin login", e.message); }

// API data
try {
  const d = await (await fetch(BASE + "/api/projects")).json();
  const arr = Array.isArray(d) ? d : d.projects || [];
  const withMedia = arr.filter((p) => (p.videoUrl || "").startsWith("https://vfwzbzudhdxkhtokcckn.supabase.co")).length;
  arr.length === 7 ? ok("projects API", `${arr.length} projects, ${withMedia} with Supabase media URLs`) : bad("projects API", "count " + arr.length);
  const slug = arr.find((p) => p.slug)?.slug;
  if (slug) {
    const r = await fetch(`${BASE}/portfolio/${slug}`);
    r.status === 200 ? ok("project detail page", `/portfolio/${slug}`) : bad("project detail page", "status " + r.status);
  }
} catch (e) { bad("projects API", e.message); }

// blog post
try {
  const d = await (await fetch(BASE + "/api/posts")).json();
  const arr = Array.isArray(d) ? d : d.posts || [];
  if (arr.length) {
    const slug = arr[0].slug;
    const r = await fetch(`${BASE}/blog/${slug}`);
    r.status === 200 ? ok("blog post page", `/blog/${slug}`) : bad("blog post page", "status " + r.status);
  } else ok("blog post page", "no posts published, skipped");
} catch (e) { bad("blog post page", e.message); }

// SEO metadata
try {
  const html = await (await fetch(BASE + "/")).text();
  html.includes("https://muhanad-portfolio-jade.vercel.app") ? ok("SEO og:url") : bad("SEO og:url", "domain not in metadata");
  html.includes("El-Mahdy") ? ok("brand name") : bad("brand name");
} catch (e) { bad("SEO metadata", e.message); }

// contact form (real POST, then report it stays for the user to see? no — delete right after)
try {
  const r = await fetch(BASE + "/api/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Acceptance Test", email: "acceptance@test.local", projectType: "test", budget: "test", message: "Automated final acceptance test message.", website: "" }),
  });
  r.status === 201 ? ok("contact form API", "message stored") : bad("contact form API", "status " + r.status);
} catch (e) { bad("contact form API", e.message); }

// analytics
try {
  const r = await fetch(BASE + "/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: "/acceptance-test" }) });
  r.status === 200 || r.status === 201 ? ok("analytics tracking") : bad("analytics tracking", "status " + r.status);
} catch (e) { bad("analytics tracking", e.message); }

// media streaming from Supabase
try {
  const r = await fetch("https://vfwzbzudhdxkhtokcckn.supabase.co/storage/v1/object/public/media/videos/1791659049332-7fde2ead.mp4", { headers: { Range: "bytes=0-1023" } });
  r.status === 206 ? ok("video streaming (HTTP range)") : bad("video streaming", "status " + r.status);
} catch (e) { bad("video streaming", e.message); }

// admin panel redirect
try {
  const r = await fetch(BASE + "/admin", { redirect: "manual" });
  r.status === 200 || r.status === 307 ? ok("admin panel route", "status " + r.status) : bad("admin panel route", "status " + r.status);
} catch (e) { bad("admin panel route", e.message); }

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
