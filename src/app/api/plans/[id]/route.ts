
// src/app/api/plans/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Plan } from '@/types';

interface Params {
  id: string;
}

// Update a plan
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const planId = params.id;
  
  if (!ObjectId.isValid(planId)) {
    return NextResponse.json({ message: 'Invalid plan ID format' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { userId, ...updateData } = body; 

    if (!userId) {
        return NextResponse.json({ message: 'userId is required for authorization' }, { status: 400 });
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'Nothing to update. Provide data to update.' }, { status: 400 });
    }
    
    // Ensure createdAt and userId are not directly updatable from client like this
    delete updateData.createdAt;
    delete updateData.userId; // userId is used for query, not $set

    const db = await getDb();
    const result = await db.collection('plans').updateOne(
      { _id: new ObjectId(planId), userId }, // Ensure user owns the plan
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Plan not found or user not authorized' }, { status: 404 });
    }
    
    // Fetch and return the updated document
    const updatedPlan = await db.collection('plans').findOne({ _id: new ObjectId(planId), userId });
     if (!updatedPlan) {
       return NextResponse.json({ message: 'Plan not found after update attempt' }, { status: 404 });
     }
    return NextResponse.json({ ...updatedPlan, id: updatedPlan._id.toString() }, { status: 200 });

  } catch (error) {
    console.error('Failed to update plan:', error);
    return NextResponse.json({ message: 'Failed to update plan', error: (error as Error).message }, { status: 500 });
  }
}

// Delete a plan
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const planId = params.id;

  if (!ObjectId.isValid(planId)) {
    return NextResponse.json({ message: 'Invalid plan ID format' }, { status: 400 });
  }
  
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'userId query parameter is required for authorization' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db.collection('plans').deleteOne({ _id: new ObjectId(planId), userId }); 

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Plan not found or user not authorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Plan deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete plan:', error);
    return NextResponse.json({ message: 'Failed to delete plan', error: (error as Error).message }, { status: 500 });
  }
}
