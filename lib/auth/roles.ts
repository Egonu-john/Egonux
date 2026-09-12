import { EGONUX_ROLES, type EgonuxRole } from '@/types/backend';

const roleSet = new Set<string>(EGONUX_ROLES);

export function parseRoles(value: unknown): EgonuxRole[] {
  if (!Array.isArray(value)) return ['member'];

  const roles = value.filter(
    (role): role is EgonuxRole => typeof role === 'string' && roleSet.has(role),
  );

  return roles.length ? [...new Set(roles)] : ['member'];
}

export function hasAnyRole(
  actual: readonly EgonuxRole[],
  required: readonly EgonuxRole[],
) {
  return required.some((role) => actual.includes(role));
}
