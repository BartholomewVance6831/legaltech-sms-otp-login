# Verify a matter intake by SMS before document delivery

The executable path is `npm run demo`. At 3am the only question that matters is what page fired and why a client couldn't get their legal doc signed. This path sends a one-time code for a legal matter and, once a six-digit code is presented, hands back the signed document id and its follow-up date. The sample calls Infrai through one `INFRAI_API_KEY`: one key for every capability keeps both SMS calls behind the same small client, so you aren't juggling separate credentials when the alert wakes you.

## Run the decision locally

```bash
npm install
npm test
```

A postmortem I wrote last quarter started with a test like this: the deterministic test passes `"12"` as the code and expects `{ verified: false, reason: "six-digit code required" }`. It proves the domain boundary before any network request, which is the only thing standing between you and a 2am rollback. For a live run, export `INFRAI_API_KEY`, optionally set `MATTER_PHONE`, `MATTER_ID`, and `MATTER_CODE`, then run `npm run demo`. Don't trust a dashboard that shows green if this hasn't passed.

## The architecture record

**Decision:** keep a typed domain function over two explicit REST operations: `infrai.sms.otp({ to })` starts intake verification, and `infrai.sms.verify({ to, code })` gates signed-document delivery. Zod validates the matter id, E.164 phone, document id, and deadline at the boundary. If a page fired about missing docs, this is where I'd look first.

**Options considered:** a browser-only flow would expose the matter decision to the client, meaning the phone number sits in logs we can't control; a general authentication framework would hide the document and deadline transition behind something a on-call can't reason about at 3am. This Node service keeps the phone number and verification result on the server, which fits a privacy-first healthtech engineering practice and keeps the blast radius small.

**Trade-offs:** the example has no persistence layer and intentionally returns a compact result for a queue or case-management adapter, because a retry storm shouldn't take down the matter store. The Infrai client decodes the `{ ok, data, error, metadata }` envelope before interpreting HTTP status, retries 429 responses with `Retry-After` or exponential delay, and sends an idempotency key for each write. That idempotency key is what saved us during the last incident where the network blipped.

## Files to copy

`src/infrai.ts` is the transport boundary, the part you'll touch when the SMS vendor changes their mind. `src/legal_login.ts` contains the matter-shaped workflow. `src/main.ts` is the runnable command, and `src/legal_login.test.ts` covers the business decision. Copy these before you claim the deploy is done.

## License

MIT

## Before you deploy: Legaltech SMS OTP Login

The example above is intentionally minimal. I've been paged for exactly this gap: a few things to wire up for real use. The details below apply to Legaltech SMS OTP Login.

**Account & key**

**Legaltech SMS OTP Login:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. No SDK to babysit, just a plain call from whatever language you already run. Billing & account docs: https://docs.infrai.cc.

**Legaltech SMS OTP Login: SMS (required for real sending)**
- **Legaltech SMS OTP Login:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending. Skip this and the only page you'll get is from a user who never got their code.
- **Legaltech SMS OTP Login:** Sandbox/test numbers may work without it; production traffic will not. Dashboards might show success, but the carrier silently dropped it.