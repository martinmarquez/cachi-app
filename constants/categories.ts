import { Category } from '@/types';

interface CategoryConfig {
  key: Category;
  label: string;
  emoji: string;
  color: string;
  calmColor: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'cotidianas',
    label: 'Cotidianas',
    emoji: '🏠',
    color: '#4ECDC4',
    calmColor: '#A8DDD9',
  },
  {
    key: 'trabajo',
    label: 'Trabajo',
    emoji: '💼',
    color: '#FFB347',
    calmColor: '#FFDBA8',
  },
  {
    key: 'social',
    label: 'Social',
    emoji: '👥',
    color: '#B19CD9',
    calmColor: '#D4CBE8',
  },
  {
    key: 'salud',
    label: 'Salud',
    emoji: '💚',
    color: '#77DD77',
    calmColor: '#B8EBB8',
  },
];

export const getCategoryConfig = (key: Category): CategoryConfig => {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
};

export const PRIORITY_LABELS: Record<number, string> = {
  1: 'Muy baja',
  2: 'Baja',
  3: 'Normal',
  4: 'Alta',
  5: 'Urgente',
};
