// Minimal test endpoint
export const runtime = 'nodejs';

export async function POST() {
  try {
    return new Response(JSON.stringify({
      success: true,
      message: 'Minimal endpoint working'
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({
      error: 'Test failed'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}