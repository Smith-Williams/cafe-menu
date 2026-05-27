/**
 * Verifies a Moyasar payment server-side (secret key never exposed to browser).
 * Deploy on Vercel: set MOYASAR_SECRET_KEY in project env.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.MOYASAR_SECRET_KEY
  if (!secret) {
    return res.status(500).json({
      error: 'MOYASAR_SECRET_KEY is not configured on the server',
    })
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }
  }

  const paymentId = body?.paymentId
  if (!paymentId || typeof paymentId !== 'string') {
    return res.status(400).json({ error: 'paymentId is required' })
  }

  const auth = Buffer.from(`${secret}:`).toString('base64')

  try {
    const r = await fetch(`https://api.moyasar.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
      },
    })

    const payment = await r.json()

    if (!r.ok) {
      return res.status(r.status).json({
        error: payment?.message || payment?.error || 'Moyasar API error',
        details: payment,
      })
    }

    return res.status(200).json({
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description ?? null,
    })
  } catch (e) {
    return res.status(502).json({
      error: e instanceof Error ? e.message : 'Upstream fetch failed',
    })
  }
}
