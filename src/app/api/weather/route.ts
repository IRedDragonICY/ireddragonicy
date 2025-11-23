import { NextRequest, NextResponse } from 'next/server';

// Cache on the edge for 10 minutes
export const revalidate = 600;

type WeatherResponse = {
  city: string;
  timezone: string;
  current: {
    temperatureC: number;
    weatherCode: number;
    description: string;
    isDay: boolean;
    humidity: number;
    windKph: number;
  };
  today: {
    tempMaxC: number;
    tempMinC: number;
    weatherCode: number;
    description: string;
  };
};

const WEATHER_CODE: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = (searchParams.get('city') || 'Jakarta').trim();

  // Jakarta coordinates (Monas area) default; if other city is provided, you can extend with geocoding later
  const coords: Record<string, { lat: number; lon: number; tz?: string }> = {
    Jakarta: { lat: -6.1753942, lon: 106.827183, tz: 'Asia/Jakarta' },
  };
  const key = Object.keys(coords).find(k => k.toLowerCase() === city.toLowerCase()) || 'Jakarta';
  const { lat, lon, tz } = coords[key];

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=${encodeURIComponent(tz || 'auto')}`;

  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) throw new Error('Failed to fetch Open‑Meteo');
    const data = await res.json();

    const currentCode: number = data?.current?.weather_code ?? 0;
    const todayCode: number = data?.daily?.weather_code?.[0] ?? currentCode;
    const body: WeatherResponse = {
      city: key,
      timezone: data?.timezone || tz || 'Asia/Jakarta',
      current: {
        temperatureC: Math.round(data?.current?.temperature_2m ?? 0),
        weatherCode: currentCode,
        description: WEATHER_CODE[currentCode] || 'Unknown',
        isDay: Boolean(data?.current?.is_day),
        humidity: Number(data?.current?.relative_humidity_2m ?? 0),
        windKph: Math.round(Number(data?.current?.wind_speed_10m ?? 0) * 3.6),
      },
      today: {
        tempMaxC: Math.round(data?.daily?.temperature_2m_max?.[0] ?? 0),
        tempMinC: Math.round(data?.daily?.temperature_2m_min?.[0] ?? 0),
        weatherCode: todayCode,
        description: WEATHER_CODE[todayCode] || 'Unknown',
      },
    };

    return NextResponse.json(body, { status: 200 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Weather fetch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


