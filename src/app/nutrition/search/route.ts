import { NextRequest, NextResponse } from 'next/server';
import { usdaService } from '@/lib/usda-nutrition';
import { verifyAuth } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, limit = 5 } = await request.json();

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // USDA search with German ingredient support
    const results = await usdaService.searchIngredient(query.trim(), limit);

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
      source: 'USDA Food Data Central',
      disclaimer: 'Nutrition values based on USDA Food Data Central. Restaurant is responsible for accuracy.'
    });

  } catch (error) {
    console.error('Nutrition search error:', error);
    
    return NextResponse.json(
      { 
        error: 'Nutrition search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}