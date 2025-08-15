import { createServerClient } from './_utils/supabaseServerClient.js';

export const handler = async (event) => {
	if (event.httpMethod === 'OPTIONS') {
		return cors(200, '');
	}

	const supabase = createServerClient();
	const authHeader = event.headers['authorization'] || event.headers['Authorization'];
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return json(401, { message: 'Missing Authorization header' });
	}
	const accessToken = authHeader.replace('Bearer ', '').trim();
	const { data: userResult, error: userError } = await supabase.auth.getUser(accessToken);
	if (userError || !userResult?.user) {
		return json(401, { message: 'Invalid or expired token' });
	}
	const userId = userResult.user.id;

	const method = event.httpMethod;
	const path = event.path || '';
	const idMatch = path.match(/\/todos\/?(.*)$/);
	const id = idMatch && idMatch[1] ? decodeURIComponent(idMatch[1]) : null;

	try {
		if (method === 'GET') {
			const { data, error } = await supabase
				.from('todos')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false });
			if (error) throw error;
			return cors(200, data);
		}

		if (method === 'POST') {
			const body = parseBody(event.body);
			if (!body.text) return json(400, { message: 'Missing text' });
			const { data, error } = await supabase
				.from('todos')
				.insert({ text: body.text, user_id: userId, completed: false })
				.select()
				.single();
			if (error) throw error;
			return cors(201, data);
		}

		if (method === 'PATCH' && id) {
			const body = parseBody(event.body);
			const update = {};
			if (typeof body.completed === 'boolean') update.completed = body.completed;
			if (typeof body.text === 'string') update.text = body.text;
			const { data, error } = await supabase
				.from('todos')
				.update(update)
				.eq('id', id)
				.eq('user_id', userId)
				.select()
				.single();
			if (error) throw error;
			return cors(200, data);
		}

		if (method === 'DELETE' && id) {
			const { error } = await supabase
				.from('todos')
				.delete()
				.eq('id', id)
				.eq('user_id', userId);
			if (error) throw error;
			return cors(204, null);
		}

		return json(405, { message: 'Method Not Allowed' });
	} catch (err) {
		return json(500, { message: err.message || 'Internal Server Error' });
	}
};

function parseBody(raw) {
	try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

function json(statusCode, body) {
	return {
		statusCode,
		headers: { 'Content-Type': 'application/json' },
		body: body == null ? '' : JSON.stringify(body),
	};
}

function cors(statusCode, body) {
	return {
		statusCode,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': 'authorization,content-type',
			'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
		},
		body: body == null ? '' : JSON.stringify(body),
	};
}