export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const u = new URL(request.url);
  
  console.log("x-vercel-id:", request.headers.get("x-vercel-id"));
  console.log("request.url:", request.url);
  
  return Response.json({
    method: request.method,
    url: request.url,
    search: u.search,
    params: Array.from(u.searchParams.entries()),
    headers: {
      host: request.headers.get("host"),
      xVercelId: request.headers.get("x-vercel-id"),
      xff: request.headers.get("x-forwarded-for"),
      proto: request.headers.get("x-forwarded-proto"),
    },
    timestamp: new Date().toISOString()
  }, { 
    headers: { "Cache-Control": "no-store" }
  });
}