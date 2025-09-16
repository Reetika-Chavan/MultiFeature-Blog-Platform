export default async function handler(req, res) {
  // Allowed IPs
  const allowedIPs = ["27.107.90.206"];

  // Get client IP (Launch adds x-forwarded-for)
  const clientIP =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection?.remoteAddress;

  if (!allowedIPs.includes(clientIP)) {
    res.statusCode = 403;
    return res.end("Access denied: IP not allowed");
  }

  // Allow request to continue to Next.js route
  return res.next();
}
