export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const { amount, currency = "GBP", orderId, customerEmail, customerName } = req.body;
  
    if (!amount || !orderId) {
      return res.status(400).json({ error: "Missing amount or orderId" });
    }
  
    try {
      // Step 1: Get SumUp access token
      const tokenRes = await fetch("https://api.sumup.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: "com.teebakes.app",
          client_secret: process.env.SUMUP_API_KEY,
        }),
      });
  
      const tokenData = await tokenRes.json();
  
      if (!tokenData.access_token) {
        console.error("SumUp token error:", tokenData);
        return res.status(500).json({ error: "Failed to get SumUp token", details: tokenData });
      }
  
      const accessToken = tokenData.access_token;
  
      // Step 2: Create SumUp checkout
      const checkoutRes = await fetch("https://api.sumup.com/v0.1/checkouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          checkout_reference: orderId,
          amount: parseFloat(amount),
          currency,
          merchant_code: process.env.SUMUP_MERCHANT_CODE,
          description: `TeeBakes Order ${orderId}`,
          return_url: `https://teebakes.vercel.app/confirmation?order=${orderId}`,
          customer_id: customerEmail,
          pay_to_email: "donutvanman@gmail.com",
        }),
      });
  
      const checkoutData = await checkoutRes.json();
  
      if (!checkoutData.id) {
        console.error("SumUp checkout error:", checkoutData);
        return res.status(500).json({ error: "Failed to create SumUp checkout", details: checkoutData });
      }
  
      // Return the SumUp hosted checkout URL
      const checkoutUrl = `https://checkout.sumup.com/pay/${checkoutData.id}`;
      return res.status(200).json({ url: checkoutUrl, checkoutId: checkoutData.id });
  
    } catch (err) {
      console.error("SumUp handler error:", err);
      return res.status(500).json({ error: "Server error", details: err.message });
    }
  }