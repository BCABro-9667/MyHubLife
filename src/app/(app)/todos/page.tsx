
"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Edit3, Trash2, CheckSquare, Square, Sparkles, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useLocalStorage } from '@/lib/localStorage';
import type { Todo } from '@/types';
import AppHeader from '@/components/layout/app-header';
import { EmptyState } from '@/components/empty-state';
import { AISuggestionModal } from '@/components/ai/ai-suggestion-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth-context'; // Import useAuth

export default function TodosPage() {
  const { userId, loading: authLoading } = useAuth(); // Get userId
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', [], userId); // Pass userId
  const [newTodoTask, setNewTodoTask] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editedTask, setEditedTask] = useState('');
  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent operations if userId is not yet available (during initial auth load)
  // The (app)/layout should handle redirect if not logged in.
  // This is an additional safeguard.
  const canOperate = mounted && !authLoading && !!userId;


  const handleAddTodo = () => {
    if (!canOperate || newTodoTask.trim() === '') return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      task: newTodoTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos([...todos, newTodo]);
    setNewTodoTask('');
    setIsAddModalOpen(false);
  };
  
  const handleAddSuggestedTodo = (task: string) => {
    if (!canOperate) return;
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      task: task,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos(prevTodos => [...prevTodos, newTodo]);
  };

  const toggleTodoCompletion = (id: string) => {
    if (!canOperate) return;
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDeleteTodo = (id: string) => {
    if (!canOperate) return;
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const openEditModal = (todo: Todo) => {
    if (!canOperate) return;
    setEditingTodo(todo);
    setEditedTask(todo.task);
    setIsEditModalOpen(true);
  };

  const handleEditTodo = () => {
    if (!canOperate || !editingTodo || editedTask.trim() === '') return;
    setTodos(
      todos.map((todo) =>
        todo.id === editingTodo.id ? { ...todo, task: editedTask.trim() } : todo
      )
    );
    setIsEditModalOpen(false);
    setEditingTodo(null);
  };

  if (!mounted || authLoading) { // Show loading if not mounted or auth is loading
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="Todos" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <ListChecks className="h-16 w-16 text-muted-foreground animate-pulse" />
        </main>
      </div>
    );
  }
  
  // If canOperate becomes false after mount (e.g. user logs out, though layout should redirect),
  // you might want to show a specific message or empty state here too.
  // However, the (app)/layout protection should make this scenario rare for this page.

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Todos">
        <Button onClick={() => setIsAISuggestionModalOpen(true)} variant="outline" size="sm" disabled={!canOperate}>
          <Sparkles className="mr-2 h-4 w-4" /> AI Suggest
        </Button>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" disabled={!canOperate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Todo
        </Button>
      </AppHeader>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {!canOperate || todos.length === 0 ? ( // Check canOperate for empty state too
          <EmptyState
            IconComponent={ListChecks}
            title={!canOperate ? "Loading Todos..." : "No Todos Yet"}
            description={!canOperate ? "Please wait." : "Get started by adding your first task or get suggestions from AI."}
            actionButtonText="Add Your First Todo"
            onActionClick={() => setIsAddModalOpen(true)}
            actionButtonDisabled={!canOperate}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-220px)]"> {/* Adjust height as needed */}
                <ul className="space-y-3">
                  {todos.map((todo) => (
                    <li
                      key={todo.id}
                      className="flex items-center justify-between p-3 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`todo-${todo.id}`}
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodoCompletion(todo.id)}
                          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        />
                        <label
                          htmlFor={`todo-${todo.id}`}
                          className={`cursor-pointer ${
                            todo.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {todo.task}
                        </label>
                      </div>
                      <div className="space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(todo)} aria-label="Edit todo">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTodo(todo.id)} aria-label="Delete todo">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Add Todo Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Todo</DialogTitle>
            <DialogDescription>What task do you want to add to your list?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="newTodoTask"
              placeholder="E.g., Buy groceries"
              value={newTodoTask}
              onChange={(e) => setNewTodoTask(e.target.value)}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTodo}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Todo Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
            <DialogDescription>Update your task details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="editedTodoTask"
              value={editedTask}
              onChange={(e) => setEditedTask(e.target.value)}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleEditTodo()}
            />
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleEditTodo}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Suggestion Modal */}
      <AISuggestionModal
        isOpen={isAISuggestionModalOpen}
        onOpenChange={setIsAISuggestionModalOpen}
        existingItems={todos}
        itemType="todo"
        onAddSuggestion={handleAddSuggestedTodo}
      />
    </div>
  );
}
