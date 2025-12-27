import { adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { steamTicket } = req.body;
  if (!steamTicket)
    return res.status(400).json({ error: "Missing steam ticket" });

  try {
    // 1. Verify Ticket with Valve
    const valveUrl = `https://api.steampowered.com/ISteamUserAuth/AuthenticateUserTicket/v1/?key=${process.env.STEAM_WEB_API_KEY}&appid=YOUR_STEAM_APP_ID&ticket=${steamTicket}`;

    const valveRes = await fetch(valveUrl);
    const valveData = await valveRes.json();

    // Check if Valve says it's valid
    if (!valveData.params || valveData.params.result !== "OK") {
      return res.status(401).json({ error: "Invalid Steam Ticket" });
    }

    const steamId = valveData.params.steamid;

    // 2. Mint a Custom Token for this Steam ID
    // We use the SteamID as the unique UID in Firebase
    const customToken = await adminAuth.createCustomToken(steamId, {
      provider: "steam", // Metadata to help us identify source later
    });

    // 3. Return the token to Unreal
    return res.status(200).json({ token: customToken, steamId });
  } catch (error) {
    console.error("Steam Auth Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
