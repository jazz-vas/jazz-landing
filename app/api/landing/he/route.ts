import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Log all request headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  console.log('Request Headers:', headers);

  return NextResponse.json({
    message: 'Headers logged to console',
    headers,
  });
}
