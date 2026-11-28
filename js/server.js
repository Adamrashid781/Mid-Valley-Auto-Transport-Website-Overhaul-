// server.js — runs the website and saves accounts in a database.
// Start it:  node server.js   (needs Node.js 22.5 or newer, nothing to install)
// Then open: http://localhost:3000/account.html

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const PORT = process.env.PORT || 3000;
const SITE_DIR = path.join(__dirname, "..");

// 1. Open the database file (created automatically the first time).
const db = new DatabaseSync(path.join(SITE_DIR, "accounts.db"));

// 2. Create the accounts table. account_id ("john smith") is the identifier,
//    so the database itself refuses two accounts with the same name.
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        account_id    TEXT PRIMARY KEY,
        first_name    TEXT NOT NULL,
        last_name     TEXT NOT NULL,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

// 3. Turn a name into the account identifier: "  John ", "SMITH" is: "john smith"
function makeAccountId(first, last) {
    return (first + " " + last).trim().toLowerCase().replace(/\s+/g, " ");
}

// 4. Passwords are never stored. We store a salted scrypt hash: "salt:hash".
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    return salt + ":" + crypto.scryptSync(password, salt, 64).toString("hex");
}

function checkPassword(password, stored) {
    const [salt, hash] = stored.split(":");
    const test = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(test, Buffer.from(hash, "hex"));
}

// 5. Small helpers: read the JSON a page sent, and send JSON back.
function readJson(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => {
            body += chunk;
            if (body.length > 10000) req.destroy();          // refuse oversized requests
        });
        req.on("end", () => {
            try { resolve(JSON.parse(body)); } catch { reject(new Error("Bad request")); }
        });
    });
}

function sendJson(res, status, data) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

// 6. CREATE button: check the details, then save the account.
async function register(req, res) {
    const data = await readJson(req);
    const firstName = String(data.firstName || "").trim();
    const lastName  = String(data.lastName || "").trim();
    const email     = String(data.email || "").trim().toLowerCase();
    const password  = String(data.password || "");

    if (!firstName || !lastName || !email.includes("@") || password.length < 8) {
        return sendJson(res, 400, { error: "Please fill in every field (password 8+ characters)." });
    }

    const accountId = makeAccountId(firstName, lastName);

    if (db.prepare("SELECT 1 FROM users WHERE account_id = ?").get(accountId)) {
        return sendJson(res, 409, { error: `An account for ${firstName} ${lastName} already exists.` });
    }
    if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) {
        return sendJson(res, 409, { error: "That email is already used by another account." });
    }

    // The ? placeholders keeps typed text from ever being run as SQL, (stops SQL injection)
    db.prepare(`INSERT INTO users (account_id, first_name, last_name, email, password_hash)
                VALUES (?, ?, ?, ?, ?)`)
      .run(accountId, firstName, lastName, email, hashPassword(password));

    sendJson(res, 201, { accountId });
}

// 7. LOGIN button: find the account by email and check the password.
async function login(req, res) {
    const data = await readJson(req);
    const email = String(data.email || "").trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user || !checkPassword(String(data.password || ""), user.password_hash)) {
        return sendJson(res, 401, { error: "Email or password is incorrect." });
    }
    sendJson(res, 200, { accountId: user.account_id, firstName: user.first_name });
}

//    Send website files (HTML, CSS, images, and .js only from the js folder).
//    server.js and accounts.db are never sent.
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
                ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml" };

function serveFile(req, res) {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const filePath = path.join(SITE_DIR, urlPath === "/" ? "index.html" : urlPath);
    const ext = path.extname(filePath).toLowerCase();
    const allowed = filePath.startsWith(SITE_DIR + path.sep) && TYPES[ext] &&
                    (ext !== ".js" || filePath.startsWith(path.join(SITE_DIR, "js") + path.sep)) && path.basename(filePath) !== "server.js";

    if (!allowed) { res.writeHead(404); return res.end("Not found"); }
    fs.readFile(filePath, (err, content) => {
        if (err) { res.writeHead(404); return res.end("Not found"); }
        res.writeHead(200, { "Content-Type": TYPES[ext] });
        res.end(content);
    });
}

// 9. Start the server and send each request to the right place.
http.createServer(async (req, res) => {
    try {
        if (req.method === "POST" && req.url === "/api/register") return await register(req, res);
        if (req.method === "POST" && req.url === "/api/login") return await login(req, res);
        if (req.method === "GET") return serveFile(req, res);
        res.writeHead(405); res.end();
    } catch {
        sendJson(res, 400, { error: "Something went wrong. Please try again." });
    }
}).listen(PORT, () => console.log(`Server running: http://localhost:${PORT}/account.html`));