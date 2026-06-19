export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, currency = "GBP", orderId } = req.body;

  if (!amount || !orderId) {
    return res.status(400).json({ error: "Missing amount or orderId" });
  }

  try {
    const checkoutRes = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUMUP_SECRET_KEY}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        amount: Number(amount),
        currency,
        pay_to_email: "donutvanman@gmail.com",
        description: `TeeBakes Order ${orderId}`,
        return_url: process.env.RETURN_URL || "https://teebakes.vercel.app/confirmation",
      }),
    });

    const checkoutData = await checkoutRes.json();

    if (!checkoutRes.ok || !checkoutData.id) {
      console.error("SumUp checkout error:", checkoutData);
      return res.status(500).json({
        error: "Failed to create SumUp checkout",
        details: checkoutData,
      });
    }

    const checkoutUrl = `https://checkout.sumup.com/pay/${checkoutData.id}`;
    return res.status(200).json({ url: checkoutUrl, checkoutId: checkoutData.id });

  } catch (err) {
    console.error("SumUp handler error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
