export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, currency = "GBP", orderId, customerEmail, customerName } = req.body;

  if (!amount || !orderId) {
    return res.status(400).json({ error: "Missing amount or orderId" });
  }

  try {
    // Step 1: Get SumUp access token using client credentials
    const tokenRes = await fetch("https://api.sumup.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: "cc_classic_4idT7p9o7NdwEeAauGHD1rS0Zg5q1",
        client_secret: process.env.SUMUP_API_KEY,
      }),
    });

    const tokenData = await tokenRes.json();
    console.log("SumUp token response:", JSON.stringify(tokenData));

    if (!tokenData.access_token) {
      return res.status(500).json({ 
        error: "Failed to get SumUp token", 
        details: tokenData 
      });
    }

    // Step 2: Create SumUp checkout
    const checkoutRes = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        checkout_reference: orderId,
        amount: parseFloat(amount).toFixed(2),
        currency,
        pay_to_email: "donutvanman@gmail.com",
        description: `TeeBakes Order ${orderId}`,
        return_url: `https://teebakes.vercel.app/confirmation?order=${orderId}`,
      }),
    });

    const checkoutData = await checkoutRes.json();
    console.log("SumUp checkout response:", JSON.stringify(checkoutData));

    if (!checkoutData.id) {
      return res.status(500).json({ 
        error: "Failed to create SumUp checkout", 
        details: checkoutData 
      });
    }

    // Return hosted checkout URL
    const checkoutUrl = `https://checkout.sumup.com/pay/${checkoutData.id}`;
    return res.status(200).json({ url: checkoutUrl, checkoutId: checkoutData.id });

  } catch (err) {
    console.error("SumUp handler error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
