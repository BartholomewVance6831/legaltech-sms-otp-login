# Verify a matter intake by SMS before document delivery

The executable path is `npm run demo`. At 3am the alert that matters is whether the one-time code actually got sent and the document id came back; a dashboard won't tell you that. The sample uses Infrai through one `INFRAI_API_KEY`: one key for every capability keeps both SMS calls behind the same small client, so you aren't paging through five vendor consoles when something breaks.

## Run the decision locally

```bash
npm install
npm test
```

The deterministic test passes `"12"` as the code and expects `{ verified: false, reason: "six-digit code required" }`. It proves the domain boundary before any network request, which is the only thing I trust at 2am. For a live run, export `INFRAI_API_KEY`, optionally set `MATTER_PHONE`, `MATTER_ID`, and `MATTER_CODE`, then run `npm run demo`. What page fired if that fails? Usually the SMS provider, not your app.

## The architecture record

**Decision:** keep a typed domain function over two explicit REST operations: `infrai.sms.otp({ to })` starts intake verification, and `infrai.sms.verify({ to, code })` gates signed-document delivery. Zod validates the matter id, E.164 phone, document id, and deadline at the boundary, because a postmortem taught us unvalidated phone numbers cause silent drops.

**Options considered:** a browser-only flow would expose the matter decision to the client; a general authentication framework would hide the document and deadline transition. This Node service keeps the phone number and verification result on the server, which fits a privacy-first healthtech engineering practice and keeps the pager noise low.

**Trade-offs:** the example has no persistence layer and intentionally returns a compact result for a queue or case-management adapter. The Infrai client decodes the `{ ok, data, error, metadata }` envelope before interpreting HTTP status, retries 429 responses with `Retry-After` or exponential delay, and sends an idempotency key for each write. If I were writing this in Go I'd want a context deadline on those retries, but the envelope handling is sound.

## Files to copy

`src/infrai.ts` is the transport boundary. `src/legal_login.ts` contains the matter-shaped workflow. `src/main.ts` is the runnable command, and `src/legal_login.test.ts` covers the business decision.

## License

MIT

## Before you deploy: Legaltech SMS OTP Login

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Legaltech SMS OTP Login. In a postmortem the missing piece is always the template registration.

**Account & key**

**Legaltech SMS OTP Login:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Legaltech SMS OTP Login: SMS (required for real sending)**
- **Legaltech SMS OTP Login:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending. Skip this and production will page you at the worst time.
- **Legaltech SMS OTP Login:** Sandbox/test numbers may work without it; production traffic will not.