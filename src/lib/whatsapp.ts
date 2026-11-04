/**
 * Meta WhatsApp Business Cloud API helper.
 * Sends a welcome template to a newly registered volunteer.
 * Silently no-ops when credentials are absent (local/dev mode).
 */
export async function sendWhatsAppWelcome(name: string, to: string): Promise<boolean> {
  const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    console.info('[whatsapp] credentials not configured — skipping welcome message');
    return false;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/[^0-9]/g, ''),
          type: 'template',
          template: {
            name: 'campaign_welcome_ola_western', // must be approved in Meta Business Manager
            language: { code: 'en' },
            components: [
              { type: 'body', parameters: [{ type: 'text', text: name }] },
            ],
          },
        }),
      },
    );
    if (!res.ok) {
      console.error('[whatsapp] send failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[whatsapp] send error', err);
    return false;
  }
}

/**
 * Forwards a lead to the AI Campaign War Room CRM endpoint.
 * No-ops when WAR_ROOM_WEBHOOK_URL is not configured.
 */
export async function pushLeadToWarRoom(lead: Record<string, unknown>): Promise<boolean> {
  const url = process.env.WAR_ROOM_WEBHOOK_URL;
  if (!url) return false;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });
    return res.ok;
  } catch (err) {
    console.error('[warroom] lead push failed', err);
    return false;
  }
}
