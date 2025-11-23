import { query } from "@/lib/db";

export default async function handler(req, res) {
  const { code } = req.query;

  if (req.method === "GET") {
    try {
      const result = await query(
        'SELECT code, "targeturl", "totalClicks", "lastClicked" FROM Link WHERE code = $1',
        [code]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Link not found." });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Get stats error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

 else if (req.method === "PUT") {
  try {
    const updateQuery = `
      UPDATE Link
      SET "totalClicks" = "totalClicks" + 1,
          "lastClicked" = NOW()
      WHERE code = $1
      RETURNING *;
    `;

    const result = await query(updateQuery, [code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Code not found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Update click stats error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

 }
  else if (req.method === "DELETE") {
    try {
      const result = await query("DELETE FROM Link WHERE code = $1", [code]);
      return res.status(204).end();
    } catch (error) {
      console.error("Delete link error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
