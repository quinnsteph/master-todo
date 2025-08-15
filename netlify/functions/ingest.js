import { createServerClient } from './_utils/supabaseServerClient.js';

export const handler = async (event) => {
	if (event.httpMethod === 'OPTIONS') return cors(200, '');
	if (event.httpMethod !== 'POST') return json(405, { message: 'Method Not Allowed' });

	const secret = event.headers['x-ingest-secret'] || event.headers['X-Ingest-Secret'];
	if (!secret || secret !== process.env.INGEST_SECRET) return json(401, { message: 'Unauthorized' });

	const targetUserId = process.env.INGEST_USER_ID;
	if (!targetUserId) return json(500, { message: 'Missing INGEST_USER_ID' });

	const supabase = createServerClient();
	const body = parseBody(event.body);
	const items = Array.isArray(body) ? body : [body];
	const rows = items
		.filter((i) => typeof i?.text === 'string' && i.text.trim().length > 0)
		.map((i) => ({
			text: i.text.trim(),
			user_id: targetUserId,
			completed: !!i.completed,
			source: i.source || 'cron',
			path: i.path || null,
			via: i.via || null,
			created_at: i.created_at || null,
		}));

	if (rows.length === 0) return cors(400, { message: 'No valid items' });

	const { data, error } = await supabase.from('todos').insert(rows).select();
	if (error) return json(500, { message: error.message });
	return cors(201, { inserted: data.length });
};

function parseBody(raw) { try { return raw ? JSON.parse(raw) : {}; } catch { return {}; } }
function json(statusCode, body) { return { statusCode, headers: { 'Content-Type': 'application/json' }, body: body == null ? '' : JSON.stringify(body) }; }
function cors(statusCode, body) { return { statusCode, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type,x-ingest-secret', 'Access-Control-Allow-Methods': 'POST,OPTIONS' }, body: body == null ? '' : JSON.stringify(body) }; }