export default async function handler(req, res) {
  // Allowed IPs
  const allowedIPs = ["27.107.90.206"];

  // Get client IP (Launch provides it in headers)
  const clientIP =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection?.remoteAddress;

  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).send("Access denied: IP not allowed");
  }

  // Continue to the Next.js route
  return res.next();
}
