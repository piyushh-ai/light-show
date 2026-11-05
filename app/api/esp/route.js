import { NextResponse } from "next/server";

async function callEsp(path) {
    const res = await fetch(`http://${process.env.ESP_IP}${path}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
    });
    return res.json();
}

export async function GET() {
    try {
        return NextResponse.json(await callEsp("/api/status"));
    } catch {
        return NextResponse.json({ error: "ESP32 se connect nahi ho paya" }, { status: 502 });
    }
}

export async function POST(req) {
    try {
        const { action, v } = await req.json();
        const n = Number(v);
        if (!Number.isFinite(n)) throw new Error("bad value");
        if (action !== "mode" && action !== "speed") throw new Error("bad action");
        return NextResponse.json(await callEsp(`/api/${action}?v=${Math.round(n)}`));
    } catch {
        return NextResponse.json({ error: "ESP32 se connect nahi ho paya" }, { status: 502 });
    }
}