# Deploy OTEL Collector to Railway

## Quick Deploy to Railway:

1. **Go to [Railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **Create a new project**
4. **Add environment variables:**
   - `DD_API_KEY`: bafa117395ce557dc6b91725e45ab171a5159cab
   - `DD_SITE`: datadoghq.com
   - `OTEL_COLLECTOR_SECRET_TOKEN`: launch-logs-secret-2025

5. **Railway will automatically deploy and give you a URL like:**
   `https://your-project-name.up.railway.app`

6. **Use this as your Endpoint URL in Contentstack Launch:**
   `https://your-project-name.up.railway.app:4317`

## Alternative: Render.com

1. **Go to [Render.com](https://render.com)**
2. **Create a new Web Service**
3. **Connect your repository**
4. **Set environment variables**
5. **Deploy and get your URL**

## Alternative: Heroku

1. **Install Heroku CLI**
2. **Create a new app:**
   ```bash
   heroku create your-otel-collector
   ```
3. **Set environment variables:**
   ```bash
   heroku config:set DD_API_KEY=bafa117395ce557dc6b91725e45ab171a5159cab
   heroku config:set DD_SITE=datadoghq.com
   heroku config:set OTEL_COLLECTOR_SECRET_TOKEN=launch-logs-secret-2025
   ```
4. **Deploy:**
   ```bash
   git add .
   git commit -m "Add OTEL Collector"
   git push heroku main
   ```
