import { NextResponse } from 'next/server';
import { comparePassword } from '@/lib/auth';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import db from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'token';

export async function POST(request: Request) {
  console.log('--- LOGIN ATTEMPT RECEIVED ---');

  if (!JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not set in environment variables.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  console.log('✅ JWT_SECRET is present.');

  try {
    const { email, password } = await request.json();
    console.log(`Attempting login for email: ${email}`);

    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      console.log('❌ User not found in database.');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    console.log(`✅ User found: ${user.id}, Role: ${user.role}`);

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      console.log('❌ Password comparison failed.');
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }
    console.log('✅ Password is valid.');

    const payload = { userId: user.id, role: user.role, email: user.email };
    console.log('JWT Payload to be signed:', payload);

    const token = sign(payload, JWT_SECRET, { expiresIn: '7d' });
    console.log(`✅ Token signed successfully. Token starts with: ${token.substring(0, 15)}...`);

    const serializedCookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    console.log('✅ Cookie serialized successfully.');

    const responseBody = {
      success: true,
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
    };
    
    const response = NextResponse.json(responseBody);
    response.headers.set('Set-Cookie', serializedCookie);
    console.log('✅ Sending successful response with Set-Cookie header.');
    
    return response;

  } catch (error) {
    console.error('❌ UNEXPECTED ERROR in login route:', error);
    return NextResponse.json({ error: 'Failed to login due to an internal error' }, { status: 500 });
  }
}