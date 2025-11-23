import { query } from '@/lib/db';

export async function getServerSideProps(context) {
  let dbStatus = 'down';
  let dbError = null;

  try {
    await query('SELECT 1'); 
    dbStatus = 'up';
  } catch (error) {
    dbError = error.message;
  }
  
  const uptimeHumanReadable = new Date(process.uptime() * 1000)
    .toISOString()
    .substring(11, 19);

  const response = {
    ok: true,
    version: "1.0",
    uptime_seconds: process.uptime(),
    uptime_human: uptimeHumanReadable,
    node_version: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString(), 
    ok: dbStatus === 'up', 
    dbStatus: dbStatus,
    dbError: dbError || undefined,
  };

  context.res.statusCode = 200;
  context.res.setHeader('Content-Type', 'application/json');
  context.res.end(JSON.stringify(response));

  return { props: {} };
}

export default function HealthCheck() {
  return null; 
}