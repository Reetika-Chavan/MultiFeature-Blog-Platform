export default async (request, context) => {
  // Allowed IPs
  const allowedIPs = ["27.107.90.206"];

  // Get client IP from headers (Launch sets this)
  const clientIP = request.headers.get("x-forwarded-for")?.split(",")[0].trim();

  // Block if not allowed
  if (!allowedIPs.includes(clientIP)) {
    return new Response("Access denied: IP not allowed", {
      status: 403,
      headers: { "content-type": "text/plain" },
    });
  }

  // Continue to the original request
  return context.next();
};
