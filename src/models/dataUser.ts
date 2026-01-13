export interface GithubEmail {
  email: string
  primary: boolean
  verified: boolean
  visibility: string
}

export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  name: string;
  blog: string;
  location: string;
}
