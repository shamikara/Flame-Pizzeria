import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = 'token';

interface UserPayload {
  userId: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verify(token, JWT_SECRET) as UserPayload;
    return payload;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}