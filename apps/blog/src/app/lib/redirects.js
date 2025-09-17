export function processRedirects(redirects, request) {
  const url = new URL(request.url);

  for (const rule of redirects) {
    if (url.pathname === rule.source) {
      return Response.redirect(
        `${url.origin}${rule.destination}`,
        rule.statusCode || 302
      );
    }
  }

  return null;
}
