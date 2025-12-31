export interface Course {
    id: string;
    title: string;
    duration: string;
    thumbnail: string; 
    level: 'Básico' | 'Intermedio' | 'Avanzado';
}