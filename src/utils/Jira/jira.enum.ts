export interface User {
  self: string;
  key: string;
  accountId: string;
  accountType: string;
  name: string;
  emailAddress: string;
  // avatarUrls: ignored parameter
  displayName: string;
  active: boolean;
  timeZone: string;
  groups: {
    size: number,
    items: [{
      name: string;
      groupId: string;
      self: string;
    }]
  },
  applicationRoles: {
    size: number,
    items: [{
      self: string;
      name: string;
      id: number;
      description: string;
    }]
  }
}

export interface TokenScope {
  id: string;
  url: string;
  name: string;
  scopes: string[];
  avatarUrl: string;
}
