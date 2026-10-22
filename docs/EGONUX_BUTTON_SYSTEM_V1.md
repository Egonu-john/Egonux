# EGONUX Ecosystem Button Design System v1.0

**Status:** Phase 1 implemented on the feature branch. Automated checks pass on the current head; the final preview refresh is blocked by Vercel's daily deployment quota. Production remains untouched.  
**Brand:** EGONUX WEALTH CENTRAL HUB  
**Motto:** LEARN. BUILD. GROW. LEAD.

## Objectives

Provide one reusable action language for EGONUX OS and incrementally for Wallet, Identity, Marketplace, Learning, Community, Game Hub, ANOSA, Agent tools, and future ecosystem products.

## Brand and geometry

- Obsidian foundation: `#0A0A0A`.
- Royal gold primary accent: `#D4AF37`.
- Champagne support tone: `#E9CE83`.
- Bone text: `#EDEAE3`.
- Default geometry: pill-shaped, fully rounded ends.
- Labels can use plain text or the optional parenthesized treatment: `( CONTINUE )`.
- Parentheses are decorative and hidden from assistive technology.
- Use the official locked EGONUX logo asset as-is when a logo is required. The button system does not recreate or alter the logo.

## Component API

`components/ui/EgonuxButton.tsx` exports `EgonuxButton`, a native semantic button with variants, sizes, optional icons, loading and full-width options, and `EgonuxActionFeedback`, an accessible result announcement for success, error, and informational states.

### Variants

| Variant | Purpose |
| --- | --- |
| `primary` | Main action within a local decision area |
| `secondary` | Important but non-primary action |
| `ghost` | Low-emphasis navigation or cancellation |
| `danger` | Destructive or security-sensitive action; use sparingly |

### Sizes

- `sm`: dense secondary interfaces.
- `md`: default interactive control; minimum 44px target height.
- `lg`: prominent page-level action.

### States and accessibility

- Keyboard users receive a visible focus outline.
- Disabled and loading controls cannot be activated.
- Loading announces its state and disables repeat activation.
- Reduced-motion preferences are respected.
- Native button semantics and accessible names are preserved.
- Optional icons are decorative; visible text remains the source of the action name.
- Feedback uses live regions: errors use an assertive alert; other feedback is polite.

## Outcome integrity and security

A UI state is not a security control. The caller must only display success after the operation has actually succeeded. Loading, optimistic UI, and local state must never be presented as proof that a payment, identity check, consent, authorization, or account change completed.

Buttons do not replace server-side authentication, authorization/RBAC, validation, audit logs, rate limits, CSRF protections where applicable, or transaction controls. Destructive actions should use a confirmation flow when impact warrants it.

## Rollout

### Implemented in Phase 1

- Shared button component, tokens, parenthesized label option, accessible loading/disabled states, and outcome-feedback guidance.
- Selected actions migrated in the OS shell/dashboard, wallet action modal and sandbox ledger, user module views, enterprise controls, ANOSA mobile and evidence review, and secure sign-in.
- Button-system contract test and targeted lint gate added to CI.
- Legacy demo credential literal removed from the Settings view; local demo key controls are explicitly labeled as demo-only and use Web Crypto for local rotation.

### Intentionally specialized

Navigation tabs, menu toggles, icon-only controls, card-like selectors, and link-based calls to action should preserve their semantics and layout rather than being forced into parenthesized text buttons. Use the shared component where the control is an action button; use a semantic link component for navigation.

### Remaining rollout work

- Complete a repository-wide inventory of remaining native action buttons and migrate them in small, testable groups.
- Review any separate public-site, Game Hub, and Agent-tool button surfaces when those routes are confirmed to be part of the same deployed application.
- Keep the PR in draft until the latest head has a fresh preview build and owner review is complete.

### Validation status

- Latest validated runtime-code commit: `ed152837af5982c8b6e420424caffe67c9134768`; the later commit updates documentation only.
- GitHub CI: build, targeted lint, button contract, Chapter 8 security harness, and Chapter 9 governance harness passed.
- CodeQL: no new alerts reported on the latest head.
- The last successful preview returned HTTP 200 for `/design-system/buttons`, `/login`, and `/os`; it is one UI commit behind the current head.
- Vercel reports its deployment API quota has been reached for the day. Refresh the preview after the 24-hour quota window.
- The public domain is behind a Cloudflare challenge and is not attached to either inspected Vercel project; no production deployment has been made.
## Preview route

Visit `/design-system/buttons` in the local or preview deployment. The page is a design preview and does not execute real account, identity, wallet, or financial operations.
