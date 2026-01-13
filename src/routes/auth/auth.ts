import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { env } from "~/config";
import { usersTable } from "~/db/schema";
import { db } from "~/drizzle";
import type { GithubEmail, GithubUser } from "~/models/dataUser";

const auth = new Hono();


auth.post("/google/login", (context) => {
  return context.text("")
})

auth.get("github/login", (context) => {
  const redirectURI = "http://localhost:3000/auth/github/callback"
  const clientID = env.GITHUB_CLIENT_API;
  const scope = "user:email"

  const url = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scope}`

  return context.redirect(url);
})

auth.get("github/callback", async (context) => {
  const code = context.req.query("code")
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_API,
      client_secret: env.GITHUB_SECRET_API,
      code
    })
  })

  const data = await tokenRes.json()

  const access_token = data["access_token"]


  const userRes = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${access_token}`,
      'User-Agent': 'Pomo-hub',
      "Accept": "application/json"
    }
  })
  const emailRes = await fetch("https://api.github.com/user/emails", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "User-Agent": "Pomo-hub",
      "Accept": "application/json"
    }
  })

  const dataUser: GithubUser = await userRes.json();
  const dataEmail: GithubEmail[] = await emailRes.json();

  const email = dataEmail.find((e) => e.primary && e.verified)?.email

  if (!email) {
    return context.json({ error: "No primary verified email found" }, 400);
  }

  const userData = {
    emailGithub: email,
    usernameGithub: dataUser.name,
    urlAvatarGithub: dataUser.avatar_url,
    githubId: dataUser.id.toString()
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.githubId, userData.githubId)
  })


  if (!user) {
    await db.insert(usersTable).values(userData)
    return context.redirect(env.FRONTEND)
  }

  await db.update(usersTable)
    .set({
      emailGithub: userData.emailGithub,
      usernameGithub: userData.usernameGithub
    })


  return context.redirect(env.FRONTEND)
})

export default auth;
