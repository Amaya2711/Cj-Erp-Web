import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "agh_session";

export interface AuthSession {
  userId: string;
  username: string;
  email: string | null;
  issuedAt: number;
}

function getSessionSecret() {
  return process.env.AUTH_SESSION_SECRET || "dev-insecure-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function encodeSession(session: AuthSession) {
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function decodeSession(rawValue: string | undefined) {
  if (!rawValue) {
    return null;
  }

  const [payload, signature] = rawValue.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (providedBuffer.length !== expectedBuffer.length) {
    return null;
  }

  const validSignature = timingSafeEqual(providedBuffer, expectedBuffer);
  if (!validSignature) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AuthSession;
    if (!parsed.userId || !parsed.username) {
      return null;
    }
    if (typeof parsed.email === "undefined") {
      parsed.email = null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setAuthSession(response: NextResponse, session: AuthSession) {
  response.cookies.set(SESSION_COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export function clearAuthSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getServerAuthSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export function getRequestAuthSession(request: NextRequest) {
  return decodeSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}
