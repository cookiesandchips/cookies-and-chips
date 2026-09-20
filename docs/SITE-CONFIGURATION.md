# Site Configuration — approved V1 scope

Owner approved provider configuration in the admin UI and explicitly selected no collection when tax is disabled or unconfigured.

## Sections

Site Configuration contains Payment Processing and Tax; use an extensible section layout for future settings. These are implementation requirements, not a claim that provider connections are operational.

### Payment Processing → PayPal

Enabled/disabled, sandbox/live mode, separate client ID/client secret/webhook ID for each mode, Test Connection, last test time/status and explicit Activate Live. No enabled, configured payment provider means checkout cannot take payment. Activation validates the selected mode's credentials and prerequisites; changing mode never falls back to another mode's secrets.

### Tax → TaxJar

Enabled/disabled, sandbox/live mode, separate API tokens, Test Connection, last test time/status and explicit Activate Live.

**Owner policy:** If tax is not configured or is explicitly disabled, the checkout tax line is $0.00 and purchases can proceed if payment processing is available. Cookies & Chips is responsible for calculating and remitting applicable taxes manually. This is a collection policy, not a determination that a sale is tax-exempt or that no tax is owed. No tax-included price adjustment is inferred.

Admin shows a persistent notice: “Automatic tax collection is off. No tax will be collected at checkout. Cookies & Chips is responsible for calculating and remitting applicable taxes manually.” Record acknowledgement and actor/time when changing to this mode. Customer copy says “Tax collected: $0.00”; do not claim tax-exempt status.

Distinguish unconfigured/disabled from operational failures. An enabled integration with expired/invalid credentials, timeouts or provider errors must show a retryable error and block payment until resolved or an authorized admin explicitly disables tax. Never silently turn failure into zero tax. Incomplete configuration cannot be enabled.

Persist order tax amount, collection mode (manual/no collection versus TaxJar), provider mode, configuration version and quote reference where applicable. Keep these snapshots unchanged after order placement. Recalculate an open checkout when mode changes and obtain customer review if its total changes; never capture a different total silently. Existing completed orders are not rewritten by a toggle.

## Credential protection

Only authorized administrators can manage configuration through server-enforced permissions. Encrypt credential values at rest with a dedicated server-only encryption key held outside the database; plan rotation/versioning. Secrets are write-only in the UI after saving: show presence and masked status, allow replacement/removal, never return plaintext through read endpoints. No browser storage, public payloads, Git history or logs may contain credentials. Test responses expose sanitized status only.

Audit actor, timestamp, provider, mode, changed field names, test result and activation/deactivation; exclude secret values. Vercel retains bootstrap infrastructure secrets and the settings encryption key. Existing provider environment variables may support deliberate bootstrap; never silently fall back to old environment credentials after admin settings are changed or disabled. Production credential-storage and authentication implementation is still pending.

## Acceptance

- Save separate sandbox/live credentials without revealing them on reread. Test uses only selected credentials and endpoint.
- Unauthorized users cannot read or mutate provider configuration. Failed save preserves prior configuration.
- Unconfigured tax permits checkout with zero tax collected and manual-responsibility admin notice.
- Explicitly disabled TaxJar makes no provider requests and collects zero tax.
- Enabled TaxJar uses returned tax; provider failures never silently become zero tax.
- Payment disabled blocks payment independently of tax mode.
- Live activation is explicit, audited and validated; switching mode revalidates outstanding quotes.
