import { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";

function areValuesValid(...values: any[]) {
  for (let value of values) {
    if (!value) return false;
    if (value.toString().trim() === "") return false;
  }
  return true;
}

function generateUsername() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let username = '';
  for (let i = 0; i < 8; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return username;
}

function getSigningTokens(payload: any) {
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY!, {
    expiresIn: "7d",
  });
  const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY!, {
    expiresIn: "2d"
  });
  const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7 * 1000,
  }

  const accessCookieOptions = { ...refreshCookieOptions, maxAge: 60 * 60 * 48 * 1000 }

  return {
    refreshToken,
    accessToken,
    refreshCookieOptions,
    accessCookieOptions
  }
}

export { areValuesValid, generateUsername, getSigningTokens };
