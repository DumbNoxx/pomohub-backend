import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { env } from "~/config";
import { usersTable } from "~/db/schema";
import { db } from "~/drizzle";
import type { GithubEmail, GithubUser } from "~/models/dataUser";

const auth = new Hono();

// TODO: Implemnt endpoint auth/me return dataUser

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
  const isProd = process.env.NODE_ENV === "production"
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
    const [newUser] = await db.insert(usersTable).values(userData).returning()
    const payloadToken = {
      sub: {
        userID: newUser.id,
        level: newUser.level
      },
      role: newUser.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60
    }

    const token = await sign(payloadToken, env.KEY_SIGNATURE)
    setCookie(context, "access_token", token, {
      path: "/",
      secure: isProd,
      httpOnly: true,
      maxAge: 60 * 60,
      sameSite: "Lax",
      ...(isProd && { domain: env.FRONTEND })
    })

    const pyaloadRefreshToken = {
      sub: {
        userID: newUser.id,
        level: newUser.level
      },
      role: newUser.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    }

    const refreshToken = await sign(pyaloadRefreshToken, env.KEY_SIGNATURE)
    setCookie(context, "refresh_token", refreshToken, {
      path: "/",
      secure: isProd,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "Lax",
      ...(isProd && { domain: env.FRONTEND })
    })

    const params = new URLSearchParams({
      username: userData.usernameGithub,
      email: userData.emailGithub,
      urlAvatar: userData.urlAvatarGithub,
      isNew: "true"
    })

    return context.redirect(`${env.FRONTEND}?${params.toString()}`)
  }

  await db.update(usersTable)
    .set({
      emailGithub: userData.emailGithub,
      usernameGithub: userData.usernameGithub
    })

  const payloadToken = {
    sub: {
      userID: user.id,
      level: user.level
    },
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60
  }


  const token = await sign(payloadToken, env.KEY_SIGNATURE)
  setCookie(context, "access_token", token, {
    path: "/",
    secure: isProd,
    httpOnly: true,
    maxAge: 60 * 60,
    sameSite: "Lax",
    ...(isProd && { domain: env.FRONTEND })
  })

  const pyaloadRefreshToken = {
    sub: {
      userID: user.id,
      level: user.level
    },
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  }

  const refreshToken = await sign(pyaloadRefreshToken, env.KEY_SIGNATURE)
  setCookie(context, "refresh_token", refreshToken, {
    path: "/",
    secure: isProd,
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: "Lax",
    ...(isProd && { domain: env.FRONTEND })
  })


  return context.redirect(env.FRONTEND)
})

export default auth;
