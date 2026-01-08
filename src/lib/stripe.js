/**
 * Stripe checkout client
 */

export async function startCheckout(priceId) {
  try {
    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ priceId })
    });

    if (!res.ok) {
      throw new Error("Failed to create checkout session");
    }

    const { url } = await res.json();
    window.location.href = url;
  } catch (error) {
    console.error("Checkout error:", error);
    throw error;
  }
}

/**
 * Stripe price IDs (replace with actual IDs from Stripe Dashboard)
 */
export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.VITE_STRIPE_PRICE_PRO_MONTHLY || "price_pro_monthly",
  ELITE_MONTHLY: process.env.VITE_STRIPE_PRICE_ELITE_MONTHLY || "price_elite_monthly"
};
