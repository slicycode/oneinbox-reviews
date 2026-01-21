import DodoPayments from "dodopayments";

let cachedClient: DodoPayments | null = null;

export const getDodoClient = (): DodoPayments => {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const baseUrl = process.env.DODO_PAYMENTS_API_URL;

  if (!apiKey || !baseUrl) {
    throw new Error(
      "DODO_PAYMENTS_API_KEY and DODO_PAYMENTS_API_URL must be set"
    );
  }

  cachedClient = new DodoPayments({
    baseURL: baseUrl,
    bearerToken: apiKey,
  });

  return cachedClient;
};
