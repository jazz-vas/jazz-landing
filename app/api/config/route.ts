import { NextResponse } from 'next/server';
import { getClientConfig } from '@/lib/config';

/**
 * Get client configuration
 * Cached since configuration rarely changes
 */
export const dynamic = 'force-static';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  return NextResponse.json(getClientConfig());
}
