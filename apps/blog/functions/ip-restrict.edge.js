// apps/blog/functions/ip-restrict.edge.js
export default async function handler(request, context) {
  const allowedIPs = ["27.107.90.206"]; // your allowed IPs

  const xff = request.headers.get("x-forwarded-for") || "";
  const ipList = xff.split(",").map(ip => ip.trim());

  const allowed = ipList.some(ip => allowedIPs.includes(ip));
  if (!allowed) {
    return new Response("Forbidden. Your IP is not allowed.", { status: 403 });
  }

  // continue request to origin
  return fetch(request);
}
