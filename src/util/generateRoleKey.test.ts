import { generateRoleKey } from './generateRoleKey';

describe('generate-role-key', () => {
  test('should generate role key - group role (with space)', () => {
    const roleName = 'Organization Admin';
    const roleKey = generateRoleKey(roleName);

    expect(roleKey).toBe('snyk_role:admin');
  });

  test('should generate role key - role extracted from user (without space)', () => {
    const roleName = 'admin';
    const roleKey = generateRoleKey(roleName);

    expect(roleKey).toBe('snyk_role:admin');
  });
});
