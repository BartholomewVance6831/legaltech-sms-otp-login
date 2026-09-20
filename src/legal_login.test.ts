import assert from "node:assert/strict";
import { verifyMatterCode } from "./legal_login.js";

const matter = { matterId: "m-1", phone: "+15551234567", documentId: "signed-1", deadline: "2026-10-01" };
const rejected = await verifyMatterCode(matter, "12");
assert.deepEqual(rejected, { verified: false, reason: "six-digit code required" });
console.log("business rule: short codes never reach the SMS verifier");
