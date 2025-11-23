import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600; // cache for 1 hour on the edge

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const base = (searchParams.get('base') || 'USD').toUpperCase();
  try {
    // Use a free, no‑auth provider
    const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) throw new Error('Failed to fetch rates');
    const data = await res.json();
    if (!data || !data.rates) throw new Error('Malformed response');
    return NextResponse.json({ base, rates: data.rates, time_last_update_utc: data.time_last_update_utc });
  } catch {
    // Fallback to a tiny static table to avoid breaking UI if offline
    const fallback = {
      USD: 1,
      EUR: 0.92,
      JPY: 155,
      GBP: 0.79,
      IDR: 16000,
      SGD: 1.35,
      CNY: 7.1,
      KRW: 1350,
      AUD: 1.5,
      CAD: 1.36,
    } as Record<string, number>;
    // If base is not USD, derive cross rates relative to USD
    const baseUSD = fallback[base] ?? 1;
    const derived: Record<string, number> = {};
    for (const k of Object.keys(fallback)) {
      derived[k] = fallback[k] / baseUSD;
    }
    return NextResponse.json({ base, rates: derived, fallback: true }, { status: 200 });
  }
}


