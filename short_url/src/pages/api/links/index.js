import { query } from "@/lib/db";

function generateRandomCode(length = 6) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { targetUrl, customCode } = req.body;
    const code = (customCode || generateRandomCode()).substring(0, 8);

    if (!targetUrl || !/^https?:\/\//i.test(targetUrl)) {
      return res.status(400).json({ message: "Valid target URL is required." });
    }
    if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
      return res
        .status(400)
        .json({
          message:
            "Invalid short code format. Must be 6-8 alphanumeric characters.",
        });
    }

    try {
      const checkResult = await query("SELECT code FROM Link WHERE code = $1", [
        code,
      ]);
      if (checkResult.rows.length > 0) {
        return res.status(409).json({ message: "Custom code already exists." });
      }
      const insertQuery = `
      INSERT INTO Link (code, targetUrl)
      VALUES ($1, $2)
      RETURNING *;
    `;
      const result = await query(insertQuery, [code, targetUrl]);

      return res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Create link error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  
  else if (req.method === "GET") {
    try {
      const result = await query(
        'SELECT code, "targeturl", "totalClicks", "lastClicked", "createdAt" FROM Link ORDER BY "createdAt" DESC'
      );

      if (!result || !result.rows) {
          throw new Error("Database query failed to return a valid result object.");
      }
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("List links error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  
  return res.status(405).json({ message: "Method Not Allowed" });
}