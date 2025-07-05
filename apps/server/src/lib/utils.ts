import jwt from "jsonwebtoken";
import axios from "axios";
import { env } from "@pkgs/zod-client";
import { CookieOptions } from "express";
import { MiddlewareUserT } from "@pkgs/lib";

// utility fucntion not used anymore
function areValuesValid(...values: any[]) {
    for (let value of values) {
        if (!value) return false;
        if (value.toString().trim() === "") return false;
    }
    return true;
}

// username subfix generator function
function generateUsername() {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let username = "";
    for (let i = 0; i < 8; i++) {
        username += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return username;
}

/**
 * A utility function to generate json web token
 * @param {Partial<MiddlewareUserT>} payload
 * @returns object containing refreshToken, AccessToken and cookieOptions
 */
function getSigningTokens(payload: Partial<MiddlewareUserT>) {
    const refreshToken = jwt.sign({ id: payload.id }, env.REFRESH_SECRET_KEY, {
        expiresIn: "4d",
    });
    const accessToken = jwt.sign(payload, env.ACCESS_SECRET_KEY, {
        expiresIn: "1min",
    });
    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 4 * 1000,
        sameSite: "none",
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
        env.STREAMER_SECRET_KEY,
        { expiresIn: "180d" }
    );
}

function verifyStreamerVerficationToken(token: string) {
    try {
        const payload = jwt.verify(token, env.STREAMER_SECRET_KEY) as {
            beneficiaryId: string;
            userId: number;
            addedAt: string;
        };
        return payload;
    } catch (error) {
        return null;
    }
}

async function fetchLocationData(ip: string): Promise<{
    ip: string;
    city: string;
    region: string;
    country: string;
    loc: string;
    org: string;
    postal: string;
    timezone: string;
} | null> {
    try {
        return (await axios.get(`https://ipinfo.io/${ip}/json`)).data;
    } catch (error) {
        return null;
    }
}

export {
    areValuesValid,
    generateUsername,
    getSigningTokens,
    signStreamerVerficationToken,
    verifyStreamerVerficationToken,
    fetchLocationData,
};
