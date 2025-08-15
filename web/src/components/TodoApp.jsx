import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TodoApp() {
	const [session, setSession] = useState(null);
	const [todos, setTodos] = useState([]);
	const [input, setInput] = useState('');
	const accessToken = session?.access_token;

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => setSession(data.session));
		const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
		return () => sub.subscription.unsubscribe();
	}, []);

	useEffect(() => {
		if (!accessToken) return;
		refresh();
	}, [accessToken]);

	async function refresh() {
		const res = await fetch('/api/todos', { headers: { Authorization: `Bearer ${accessToken}` } });
		if (!res.ok) return setTodos([]);
		const data = await res.json();
		setTodos(data || []);
	}

	async function addTodo(e) {
		e.preventDefault();
		if (!input.trim()) return;
		await fetch('/api/todos', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
			body: JSON.stringify({ text: input.trim() }),
		});
		setInput('');
		refresh();
	}

	async function toggleTodo(id, completed) {
		await fetch(`/api/todos/${id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
			body: JSON.stringify({ completed }),
		});
		refresh();
	}

	async function deleteTodo(id) {
		await fetch(`/api/todos/${id}`, {
			method: 'DELETE',
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		refresh();
	}

	async function signIn() {
		const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
		if (error) alert(error.message);
	}

	async function signOut() {
		await supabase.auth.signOut();
	}

	if (!session) {
		return (
			<div style={{ padding: 24 }}>
				<h1>Master TODO</h1>
				<button onClick={signIn}>Sign in with Google</button>
			</div>
		);
	}

	return (
		<div style={{ padding: 24, maxWidth: 600 }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<h1>Master TODO</h1>
				<div>
					<span style={{ marginRight: 12 }}>{session.user.email}</span>
					<button onClick={signOut}>Sign out</button>
				</div>
			</div>
			<form onSubmit={addTodo} style={{ marginTop: 16, marginBottom: 16 }}>
				<input value={input} onChange={(e) => setInput(e.target.value)} placeholder="New todo" style={{ width: '70%' }} />
				<button type="submit" style={{ marginLeft: 8 }}>Add</button>
			</form>
			<ul>
				{todos.map((t) => (
					<li key={t.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
						<input type="checkbox" checked={t.completed} onChange={(e) => toggleTodo(t.id, e.target.checked)} />
						<span style={{ marginLeft: 8, textDecoration: t.completed ? 'line-through' : 'none' }}>{t.text}</span>
						<button onClick={() => deleteTodo(t.id)} style={{ marginLeft: 'auto' }}>Delete</button>
					</li>
				))}
			</ul>
		</div>
	);
}