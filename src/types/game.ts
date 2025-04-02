export interface Territory {
  id: string;
  name: string;
  ownerId: string | null;
  troops: number;
  xPosition: number;
  yPosition: number;
} 