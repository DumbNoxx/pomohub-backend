import "dotenv/config"

class Environment {
  public readonly FRONTEND: string;
  public readonly PORT: number;
  public readonly DATABASE_URL: string;
  public readonly GITHUB_CLIENT_API: string;
  public readonly GITHUB_SECRET_API: string;
  public readonly KEY_SIGNATURE: string;


  constructor() {
    const { PORT, FRONTEND, DATABASE_URL, GITHUB_CLIENT_API, GITHUB_SECRET_API, KEY_SIGNATURE } = process.env;

    if (!FRONTEND) throw new Error("Frontend url is required in env file")
    if (!DATABASE_URL) throw new Error("DATABASE_URL is required in env file")
    if (!(GITHUB_CLIENT_API && GITHUB_SECRET_API)) throw new Error("Credentials of github app is required in env file")
    if (!(KEY_SIGNATURE)) throw new Error("KEY_SIGNATURE is required in env file")

    this.PORT = Number(PORT) || 3000;
    this.DATABASE_URL = DATABASE_URL;
    this.FRONTEND = process.env.NODE_ENV ? FRONTEND : "http://localhost:5173";
    this.GITHUB_CLIENT_API = GITHUB_CLIENT_API;
    this.GITHUB_SECRET_API = GITHUB_SECRET_API;
    this.KEY_SIGNATURE = KEY_SIGNATURE;

  }
}

export const env = new Environment();
