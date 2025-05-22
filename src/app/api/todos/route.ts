
// src/app/api/todos/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import type { Todo } from '@/types';
import { ObjectId } from 'mongodb';

// Get all todos for a user
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'userId is required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const todos = await db.collection<Omit<Todo, 'id'> & { _id?: ObjectId, userId: string }>('todos')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    const formattedTodos = todos.map(todo => ({
      ...todo,
      id: todo._id!.toString(), // Convert ObjectId to string and map to id
    }));

    return NextResponse.json(formattedTodos, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch todos:', error);
    return NextResponse.json({ message: 'Failed to fetch todos', error: (error as Error).message }, { status: 500 });
  }
}

// Create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task, userId, completed = false } = body;

    if (!task || !userId) {
      return NextResponse.json({ message: 'Task and userId are required' }, { status: 400 });
    }

    const db = await getDb();
    const newTodoData: Omit<Todo, 'id'> & { userId: string } = {
      task,
      completed,
      createdAt: new Date().toISOString(),
      userId,
    };
    
    const result = await db.collection('todos').insertOne(newTodoData);

    if (!result.insertedId) {
        throw new Error('Failed to insert todo');
    }

    const newTodo: Todo = {
      ...newTodoData,
      id: result.insertedId.toString(),
    };

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Failed to create todo:', error);
    return NextResponse.json({ message: 'Failed to create todo', error: (error as Error).message }, { status: 500 });
  }
}
