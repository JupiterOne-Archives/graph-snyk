export const generateRoleKey = (roleName: string) =>
  `snyk_role:${
    roleName.includes(' ') ? roleName.split(' ')[1].toLowerCase() : roleName
  }`;
