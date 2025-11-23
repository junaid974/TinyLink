import { query } from "@/lib/db";

export async function getServerSideProps({ params, res }) {
  const code = params.code;

  try {
    const result = await query(
      'SELECT "targeturl", "totalClicks" FROM Link WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      res.statusCode = 404;
      return { props: { notFound: true } };
    }
    await query(
      `UPDATE Link
       SET "totalClicks" = "totalClicks" + 1,
           "lastClicked" = NOW()
       WHERE code = $1`,
      [code]
    );
    res.writeHead(302, { Location: result.rows[0].targeturl });
    res.end();

    return { props: {} };
  } catch (error) {
    console.error("Redirect error:", error);
    res.statusCode = 500;
    return { props: { notFound: true } };
  }
}

export default function RedirectPage({ notFound }) {
  if (notFound) return <h1>404: Short code not found</h1>;
  return null;
}
