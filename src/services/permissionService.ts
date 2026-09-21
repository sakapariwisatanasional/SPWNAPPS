// src/services/permissionService.ts

export const SPWN_ROLE_LEVEL: Record<string, number> = {
  "SUPER_ADMIN": 5,
  "ADMIN_NATIONAL": 4,
  "ADMIN_REGION": 3,
  "MEMBER": 2,
  "GUEST": 1
};

export function getLevelByRole(role?: string): number {
  if (!role) return 1;
  const upperRole = String(role).toUpperCase();
  return SPWN_ROLE_LEVEL[upperRole] || 1;
}

export function hasPermissionLevel(userLevel: number, requiredLevel: number): boolean {
  return Number(userLevel) >= Number(requiredLevel);
}

export function checkUserRole(role?: string, requiredLevel: number = 1): boolean {
  const level = getLevelByRole(role);
  return hasPermissionLevel(level, requiredLevel);
}

export function getUserPermission(role?: string) {
  const level = getLevelByRole(role);
  return {
    role: role || 'GUEST',
    level,
    canSpreadsheetAccess: level >= 4,
    canManageMember: level >= 3,
    canViewStatistic: level >= 2,
    canViewOwnProfile: level >= 2,
    canPublicVerify: true
  };
}