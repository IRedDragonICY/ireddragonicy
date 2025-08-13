export async function GET(request: Request) {
  const target = new URL('/sitemap.xml', request.url);
  return Response.redirect(target, 308);
}


