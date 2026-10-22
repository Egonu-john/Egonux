# EGONUX Ecosystem Button Design System v1.0

**Status:** Initial implementation on a feature branch; review and automated validation required before rollout.  
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

1. Establish the shared component and token foundation.
2. Review the `/design-system/buttons` preview and run lint, typecheck, build, and smoke checks.
3. Adopt the shared component in EGONUX OS shell and module views in small, testable changes.
4. Extend to the public website, Wallet, Identity, Marketplace, Learning, Community, Game Hub, ANOSA, and Agent tools.
5. Keep changes on a feature branch and do not merge until validation and owner review are complete.

## Preview route

Visit `/design-system/buttons` in the local or preview deployment. The page is a design preview and does not execute real account, identity, wallet, or financial operations.
