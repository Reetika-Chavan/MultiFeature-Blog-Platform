import contentstack from "contentstack";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from the blog's .env file
dotenv.config({ path: path.join(process.cwd(), "apps/blog/.env") });

const apiKey = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY;
const deliveryToken = process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN;
const environment = process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT;

if (!apiKey || !deliveryToken || !environment) {
  throw new Error(
    "❌ Missing one of: NEXT_PUBLIC_CONTENTSTACK_API_KEY, NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN, or NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT in apps/blog/.env"
  );
}

export const Stack = contentstack.Stack({
  api_key: apiKey,
  delivery_token: deliveryToken,
  environment: environment.toLowerCase(),
});

Stack.setHost("dev11-cdn.csnonprod.com");
