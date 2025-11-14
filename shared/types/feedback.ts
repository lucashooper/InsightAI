export interface Feedback {
  id: string;
  user_id: string;
  title: string;
  message: string;
  status: 'new' | 'read' | 'resolved';
  created_at: string;
  updated_at: string;
  user_email?: string;
}
