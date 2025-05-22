
// src/app/api/todos/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface Params {
  id: string;
}

// Update a todo
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  const todoId = params.id;
  
  if (!ObjectId.isValid(todoId)) {
    return NextResponse.json({ message: 'Invalid todo ID format' }, { status: 400 });
  }

  try {
    const body = await request.json();
    // userId should be passed to ensure user can only update their own todos
    // For this example, we assume it's passed in body, but token verification would be better
    const { task, completed, userId } = body; 

    if (!userId) {
        return NextResponse.json({ message: 'userId is required for authorization' }, { status: 400 });
    }

    if (typeof task === 'undefined' && typeof completed === 'undefined') {
      return NextResponse.json({ message: 'Nothing to update. Provide task or completed status.' }, { status: 400 });
    }

    const updates: { task?: string; completed?: boolean } = {};
    if (typeof task !== 'undefined') updates.task = task;
    if (typeof completed !== 'undefined') updates.completed = completed;

    const db = await getDb();
    const result = await db.collection('todos').updateOne(
      { _id: new ObjectId(todoId), userId }, // Ensure user owns the todo
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Todo not found or user not authorized' }, { status: 404 });
    }
    if (result.modifiedCount === 0 && result.matchedCount ===1) {
      // Matched but nothing changed, possibly same data sent
      // Fetch the current item to return it
       const updatedTodo = await db.collection('todos').findOne({ _id: new ObjectId(todoId), userId });
       if (!updatedTodo) {
         return NextResponse.json({ message: 'Todo not found after update attempt' }, { status: 404 });
       }
       return NextResponse.json({ ...updatedTodo, id: updatedTodo._id.toString() }, { status: 200 });
    }

    const updatedTodo = await db.collection('todos').findOne({ _id: new ObjectId(todoId), userId });
    if (!updatedTodo) {
        // This should ideally not happen if update was successful
        return NextResponse.json({ message: 'Failed to retrieve updated todo' }, { status: 500 });
    }
    
    return NextResponse.json({ ...updatedTodo, id: updatedTodo._id.toString() }, { status: 200 });
  } catch (error) {
    console.error('Failed to update todo:', error);
    return NextResponse.json({ message: 'Failed to update todo', error: (error as Error).message }, { status: 500 });
  }
}

// Delete a todo
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  const todoId = params.id;

  if (!ObjectId.isValid(todoId)) {
    return NextResponse.json({ message: 'Invalid todo ID format' }, { status: 400 });
  }
  
  // For DELETE, userId should ideally come from verified token or query param for safety.
  // Here, we'll expect it as a query parameter for consistency with GET, or from request body.
  const searchParams = request.nextUrl.searchParams;
  let userId = searchParams.get('userId');

  if (!userId) {
    try {
      const body = await request.json();
      userId = body.userId;
    } catch (e) {
      // No body or invalid JSON, userId remains null
    }
  }

  if (!userId) {
    return NextResponse.json({ message: 'userId is required for authorization' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db.collection('todos').deleteOne({ _id: new ObjectId(todoId), userId }); // Ensure user owns the todo

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Todo not found or user not authorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Todo deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete todo:', error);
    return NextResponse.json({ message: 'Failed to delete todo', error: (error as Error).message }, { status: 500 });
  }
}
