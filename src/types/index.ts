

export interface User {
  id: string; // Corresponds to MongoDB's _id
  email: string;
  passwordHash?: string; // Only on server, not sent to client
  createdAt: string;
  _id?: string; // Optional from MongoDB driver
}


export interface Todo {
  id: string; // Corresponds to MongoDB's _id as a string
  task: string;
  completed: boolean;
  createdAt: string;
  userId: string; // To associate todo with a user
  _id?: string; // Optional, as it will be mapped to id. MongoDB driver might return this.
}

export interface PasswordEntry {
  id: string;
  websiteName: string; // Changed from 'website' for clarity
  url?: string;
  username: string;
  passwordValue: string; // Stored as plain text in localStorage with strong disclaimers
  notes?: string;
  createdAt: string;
}

export interface WebsiteLink {
  id: string;
  name: string;
  url: string;
  category?: string;
  description?: string;
  createdAt: string;
}

export interface CardInfo {
  id: string;
  cardName: string; // e.g., "Visa ending 1234", "My Shopping Card"
  cardType: 'credit' | 'debit' | 'other';
  bankName?: string;
  lastFourDigits?: string; // Optional, if user wants to add
  expiryDate?: string; // Optional, format MM/YY
  cardHolderName?: string; // Optional
  notes?: string; // For storing related links, login URLs, or other info
  associatedWebsiteLoginIds?: string[]; // IDs of PasswordEntry for quick access
  createdAt: string;
}

export interface Plan {
  id: string; // Corresponds to MongoDB's _id as a string
  title: string;
  description: string;
  dueDate?: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  priority?: 'Low' | 'Medium' | 'High';
  createdAt: string;
  userId: string; // To associate plan with a user
  _id?: string; // Optional, as it will be mapped to id. MongoDB driver might return this.
}

export interface Story {
  id: string;
  title: string;
  content: string;
  genre?: string;
  status?: 'Draft' | 'In Progress' | 'Completed';
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string; // placeholder URL or actual URL if linked
  caption?: string;
  albumId: string;
  createdAt: string;
  dataAiHint?: string; // For placeholder images
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string; // Optional cover image for the album
  createdAt: string;
  dataAiHint?: string; // For placeholder cover images
}

// Union type for AI suggestions
export type SuggestibleContent = Todo | Plan | Story; // Todo and Plan will now come from DB
export type SuggestibleType = 'todo' | 'plan' | 'story';
