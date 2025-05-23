
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import type { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const db = await getDb();
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUserDocument: Omit<User, 'id' | 'passwordHash'> & { email: string; passwordHash: string } = {
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection('users').insertOne(newUserDocument);

    if (!result.insertedId) {
      return NextResponse.json({ message: 'Failed to register user' }, { status: 500 });
    }
    
    const createdUser: Omit<User, 'passwordHash'> = {
        id: result.insertedId.toString(),
        email: newUserDocument.email,
        createdAt: newUserDocument.createdAt,
    };

    return NextResponse.json({ user: createdUser, message: 'User registered successfully' }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred', error: (error as Error).message }, { status: 500 });
  }
}
