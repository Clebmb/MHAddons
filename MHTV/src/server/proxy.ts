import type { Request, Response } from "express";
import { appConfig } from "../lib/config.js";

export async function proxyStream(req: Request, res: Response) {
  const url = String(req.query.url ?? "");
  const headersToken = String(req.query.headers ?? "");
  const headers = headersToken
    ? (JSON.parse(Buffer.from(headersToken, "base64url").toString("utf8")) as Record<string, string>)
    : {};
  const upstreamHeaders = Object.fromEntries(
    Object.entries(headers).filter(([key]) => !key.toLowerCase().startsWith("x-mhtv-"))
  );

  if (!url) {
    res.status(400).json({ error: "Missing url" });
    return;
  }

  const upstream = await fetch(url, {
    headers: {
      "User-Agent": appConfig.userAgent,
      Referer: appConfig.proxyReferer,
      ...upstreamHeaders
    },
    redirect: "follow"
  });

  res.status(upstream.status);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/vnd.apple.mpegurl");

  if (!upstream.body) {
    res.end();
    return;
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());
  res.send(buffer);
}
