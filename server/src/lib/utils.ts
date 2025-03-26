import { CookieOptions } from "express";
import jwt from "jsonwebtoken";
import { MiddlewareUserT } from "./types";

function areValuesValid(...values: any[]) {
  for (let value of values) {
    if (!value) return false;
    if (value.toString().trim() === "") return false;
  }
  return true;
}

function generateUsername() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let username = "";
  for (let i = 0; i < 8; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return username;
}

function getSigningTokens(payload: any) {
  const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY!, {
    expiresIn: "4d",
  });
  const accessToken = jwt.sign(payload, process.env.ACCESS_SECRET_KEY!, {
    expiresIn: "5min",
  });
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 4 * 1000,
    sameSite: "none"
  };

  return { refreshToken, accessToken, cookieOptions };
}

function signStreamerVerficationToken(payload: {
  beneficiaryId: string;
  userId: string;
  addedAt: string;
}) {
  return jwt.sign(
    {
      beneficiaryId: payload["beneficiaryId"],
      userId: payload["userId"],
      addedAt: payload["addedAt"],
    },
    process.env.STREAMER_SECRET_KEY!,
    { expiresIn: "180d" }
  );
}

function verifyStreamerVerficationToken(token: string) {
  try {
    const payload = jwt.verify(token, process.env.STREAMER_SECRET_KEY!) as {
      beneficiaryId: string;
      userId: number;
      addedAt: string;
    };
    return payload;
  } catch (error) {
    return null;
  }
}

export type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];

const ROLES = {
  streamer: [
    "chat:create",
    "chat:delete",
    "chat:message:own-update", // self message update
    "chat:mark-read",
    "chat:view",
    "stream:create",
    "stream:update",
    "stream:view",
    "stream:user:block",
  ],
  // moderator: [
  //     "chat:create",
  //     "chat:delete",
  //     "chat:message:own-update", // self message update
  //     "chat:view",
  //     "stream:view",
  //     "stream:user:block",
  //     "chat:own-upvote",
  //     "chat:own-downvote"
  // ],
  viewer: [
    "chat:create",
    "chat:delete",
    "chat:message:own-update", // self message update
    "chat:view",
    "stream:view",
    "chat:own-upvote",
    "chat:own-downvote",
  ],
} as const;

function hasPermission(user: MiddlewareUserT, permission: Permission) {
  if (user.role == "streamer" && user.streamerToken) {
    const result = verifyStreamerVerficationToken(user.streamerToken);
    if (result?.userId != user.id) user.role = "viewer";
  } else if (user.role == "streamer") {
    user.role = "viewer";
  }
  return (ROLES[user.role] as readonly Permission[]).includes(permission);
}

export {
  areValuesValid,
  generateUsername,
  getSigningTokens,
  hasPermission,
  signStreamerVerficationToken,
};
