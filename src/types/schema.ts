export interface Board {
  id: string;
  name: string;
  last_accessed: string;
}

export interface CanvasElement {
  id: string;
  board_id: string;
  type: 'sticky-note' | 'image' | 'pdf';
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  title: string;
  content: string;
  color: string;
  is_trashed: boolean;
  trashed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  element_id: string | null;
  local_path: string;
  trash_path: string | null;
  created_at: string;
}

export type NoteColor = {
  name: string;
  bg: string;
  pin: string;
  border: string;
  text: string;
};

export const NOTE_COLORS: NoteColor[] = [
  { name: 'amber', bg: '#FEF3C7', pin: '#F59E0B', border: '#FCD34D', text: '#92400E' },
  { name: 'rose', bg: '#FCE7F3', pin: '#EC4899', border: '#F9A8D4', text: '#9D174D' },
  { name: 'sky', bg: '#E0F2FE', pin: '#0EA5E9', border: '#7DD3FC', text: '#0C4A6E' },
  { name: 'emerald', bg: '#D1FAE5', pin: '#10B981', border: '#6EE7B7', text: '#065F46' },
  { name: 'violet', bg: '#EDE9FE', pin: '#8B5CF6', border: '#C4B5FD', text: '#5B21B6' },
  { name: 'orange', bg: '#FFEDD5', pin: '#F97316', border: '#FDBA74', text: '#9A3412' },
];
