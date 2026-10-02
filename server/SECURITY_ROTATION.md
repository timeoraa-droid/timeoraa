# TIMEORA Credential Rotation Checklist

If real credentials were ever committed, shared, or deployed, rotate them in the provider and every deployment environment. Never copy credential values into this file, source code, or chat.

- [ ] Replace the MongoDB database user password and review Atlas network access.
- [ ] Generate a new strong `JWT_SECRET`; redeploy every API instance together.
- [ ] Rotate SMTP credentials if real credentials were configured.
- [ ] Reset the admin password through the secure admin setup procedure.
- [ ] Rotate Razorpay API and webhook secrets if they were configured.
- [ ] Store runtime credentials only in the backend secret manager or ignored local `.env`.
- [ ] Keep `.env.example` limited to variable names and non-secret placeholders.
- [ ] Review repository history and revoke any credential that may have been exposed there.
