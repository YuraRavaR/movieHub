const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type AuthMe = {
  id: string;
  email: string;
};

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message.join(', ');
    }
    if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
      return payload.message;
    }
  } catch {
    // Ignore parsing errors and fallback to default message.
  }

  return fallback;
}

export async function signup(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const message = await parseErrorMessage(response, `Signup failed (${response.status})`);
    throw new Error(message);
  }
}

export async function login(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const message = await parseErrorMessage(response, `Login failed (${response.status})`);
    throw new Error(message);
  }
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    const message = await parseErrorMessage(response, `Logout failed (${response.status})`);
    throw new Error(message);
  }
}

export async function me(): Promise<AuthMe | null> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (response.status === 401) return null;
  if (!response.ok) {
    const message = await parseErrorMessage(response, `Me failed (${response.status})`);
    throw new Error(message);
  }
  return (await response.json()) as AuthMe;
}
