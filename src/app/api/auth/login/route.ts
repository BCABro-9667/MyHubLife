
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import type { User } from '@/types'; // Ensure User type is defined correctly

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const db = await getDb();
    const userDocument = await db.collection<User>('users').findOne({ email: email.toLowerCase() });

    if (!userDocument) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (!userDocument.passwordHash) {
      console.error(`User ${email} found but has no passwordHash.`);
      return NextResponse.json({ message: 'Authentication error for user.' }, { status: 500 });
    }

    const isMatch = await bcrypt.compare(password, userDocument.passwordHash);

    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Important: Do NOT send the passwordHash to the client.
    const userToReturn: Omit<User, 'passwordHash'> = {
      id: userDocument._id!.toString(), // Use _id from MongoDB document
      email: userDocument.email,
      createdAt: userDocument.createdAt,
    };
    
    // In a real app, you'd generate a JWT or session token here
    // and send it back. For this example, we're just returning user info.
    return NextResponse.json({ user: userToReturn, message: 'Login successful' }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred', error: (error as Error).message }, { status: 500 });
  }
}
