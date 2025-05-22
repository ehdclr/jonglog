export interface BlogSettings {
  id: string;
  blogName: string;
  blogDescription: string;
  logoUrl?: string;
  githubUrl?: string;
  isGithubPublic: boolean;
  contactEmail?: string;
  isEmailPublic: boolean;
  snsUrl?: string;
  isSnsPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}
