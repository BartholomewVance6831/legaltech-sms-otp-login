import { requestMatterCode, verifyMatterCode } from "./legal_login.js";

const input = { matterId: process.env.MATTER_ID ?? "matter-42", phone: process.env.MATTER_PHONE ?? "+15551234567", documentId: "engagement-letter", deadline: "2026-10-01" };
console.log(await requestMatterCode(input));
if (process.env.MATTER_CODE) console.log(await verifyMatterCode(input, process.env.MATTER_CODE));
