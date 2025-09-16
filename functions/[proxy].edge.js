export default async function handler(request, context) {
  const url = new URL(request.url);

  if (url.pathname === "/appliances") {
    const html = `
      <html>
        <head>
          <title>Edge Function Demo</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              background: #f0f8ff;
            }
            .card {
              background: white;
              padding: 2rem;
              border-radius: 12px;
              box-shadow: 0 6px 12px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 400px;
            }
            h1 {
              color: #1e40af;
            }
            p {
              font-size: 1.1rem;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🏭 Edge Function Executed!</h1>
            <p>Time: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "no-store",
      },
    });
  }

  return fetch(request);
}