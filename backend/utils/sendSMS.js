import axios from "axios";

export async function sendSMS(mobile, variables = {}) {
  try {
    const url = "https://control.msg91.com/api/v5/flow/";

    const payload = {
      flow_id: process.env.MSG91_TEMPLATE_ID,
      sender: process.env.MSG91_SENDER_ID,
      mobiles: `91${mobile}`, 
      ...variables, // dynamic template variables
    };

    const headers = {
      authkey: process.env.MSG91_AUTH_KEY,
      "Content-Type": "application/json"
    };

    const response = await axios.post(url, payload, { headers });
    console.log("📩 SMS Sent:", response.data);
    return true;

  } catch (error) {
    console.error("❌ SMS ERROR:", error.response?.data || error.message);
    return false;
  }
}
