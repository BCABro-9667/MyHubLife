
// src/app/api/plans/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { Plan } from '@/types';
import { ObjectId } from 'mongodb';

// Get all plans for a user
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'userId is required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const plans = await db.collection<Omit<Plan, 'id'> & { _id?: ObjectId, userId: string }>('plans')
      .find({ userId })
      .sort({ createdAt: -1 }) // Assuming you want to sort by creation date
      .toArray();
    
    const formattedPlans = plans.map(plan => ({
      ...plan,
      id: plan._id!.toString(),
    }));

    return NextResponse.json(formattedPlans, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch plans:', error);
    return NextResponse.json({ message: 'Failed to fetch plans', error: (error as Error).message }, { status: 500 });
  }
}

// Create a new plan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, dueDate, status, priority, userId } = body;

    if (!title || !userId || !description || !status) {
      return NextResponse.json({ message: 'Title, description, status, and userId are required' }, { status: 400 });
    }

    const db = await getDb();
    const newPlanData: Omit<Plan, 'id'> = {
      title,
      description,
      dueDate: dueDate || undefined, // Handle optional dueDate
      status,
      priority: priority || 'Medium', // Default priority
      createdAt: new Date().toISOString(),
      userId,
    };
    
    const result = await db.collection('plans').insertOne(newPlanData);

    if (!result.insertedId) {
        throw new Error('Failed to insert plan');
    }

    const newPlan: Plan = {
      ...newPlanData,
      id: result.insertedId.toString(),
    };

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error('Failed to create plan:', error);
    return NextResponse.json({ message: 'Failed to create plan', error: (error as Error).message }, { status: 500 });
  }
}
