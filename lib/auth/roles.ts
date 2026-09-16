import { EGONUX_ROLES, type EgonuxRole } from '@/types/backend';

const roleSet = new Set<string>(EGONUX_ROLES);

export function parseRoles(value: unknown): EgonuxRole[] {
  if (!Array.isArray(value)) return ['member'];

  const roles = value.filter(
    (role): role is EgonuxRole => typeof role === 'string' && roleSet.has(role),
  );

  return roles.length ? [...new Set(roles)] : ['member'];
}

function parseEmailAllowlist(value: string | undefined) {
  return new Set(
    (value ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function resolveRoles(claims: unknown, email: string | null | undefined) {
  const roles = parseRoles(claims);
  const normalizedEmail = email?.trim().toLowerCase();
  const founderEmails = parseEmailAllowlist(process.env.EGONUX_FOUNDER_EMAILS);

  if (normalizedEmail && founderEmails.has(normalizedEmail)) {
    return [...new Set<EgonuxRole>([...roles, 'founder'])];
  }

  return roles;
}

export function hasAnyRole(
  actual: readonly EgonuxRole[],
  required: readonly EgonuxRole[],
) {
  return required.some((role) => actual.includes(role));
}
