# Datadog Log Target Setup

This guide will help you set up a log target to forward application logs from Contentstack Launch to Datadog.

## Prerequisites

1. Datadog account with API key access
2. Docker and Docker Compose installed
3. Contentstack Launch project

## Step 1: Get Your Datadog API Key

1. Log in to your Datadog account
2. Navigate to **Organization Settings** > **API Keys**
3. Click **New Key** and give it a name (e.g., "Contentstack Launch Logs")
4. Copy the API key - you'll need it for the configuration

## Step 2: Configure Environment Variables

1. Copy the environment template:

   ```bash
   cp datadog.env.example datadog.env
   ```

2. Edit `datadog.env` and add your Datadog credentials:
   - `DD_API_KEY`: Your Datadog API key from Step 1
   - `DD_SITE`: Your Datadog site (default: `datadoghq.com`, or `datadoghq.eu` for EU)
   - `OTEL_COLLECTOR_SECRET_TOKEN`: A secure token for authentication

## Step 3: Start OTEL Collector

1. Start the OTEL Collector using Docker Compose:

   ```bash
   docker-compose -f docker-compose.datadog.yml --env-file datadog.env up -d
   ```

2. Verify the collector is running:

   ```bash
   docker-compose -f docker-compose.datadog.yml ps
   ```

3. Check the logs to ensure it's working:
   ```bash
   docker-compose -f docker-compose.datadog.yml logs -f
   ```

## Step 4: Configure Contentstack Launch Log Target

1. Log in to your Contentstack account
2. Navigate to **Launch** > **Settings** > **Log Targets**
3. Click **"Create New Log Target"**
4. Fill in the details:
   - **Name**: `Datadog Logs`
   - **Endpoint URL**: `http://your-domain:4317` (replace with your actual domain)
   - **Authorization Type**: Bearer Token
   - **Token**: The token you set in `OTEL_COLLECTOR_SECRET_TOKEN`

## Step 5: Test the Setup

1. Generate some logs in your Launch application
2. Check Datadog Logs console for incoming logs
3. Look for logs with the service name `contentstack-launch-blog`

## Step 6: View Logs in Datadog

1. Go to **Datadog** > **Logs** > **Search**
2. Use this query to filter your logs:
   ```
   service:contentstack-launch-blog
   ```
3. You should see logs from your Contentstack Launch application

## Troubleshooting

- **No logs appearing**: Check that the OTEL Collector is running and accessible
- **Authentication errors**: Verify your Datadog API key is correct
- **Connection issues**: Ensure the log target endpoint URL is correct
- **Check Docker logs**: `docker-compose -f docker-compose.datadog.yml logs`

## Datadog Site Configuration

If you're using a different Datadog site, update the `DD_SITE` environment variable:

- US: `datadoghq.com` (default)
- EU: `datadoghq.eu`
- US3: `us3.datadoghq.com`
- US5: `us5.datadoghq.com`
- AP1: `ap1.datadoghq.com`
