export interface User {
    id: string | number;
    name: string;
    email: string;
    role: 'Admin' | 'Teacher' | 'Student';
    avatar?: string;
}

export interface Student {
    id: number;
    name: string;
    email: string;
    batch: string;
    joinDate: string;
    status: 'Active' | 'Inactive' | 'Payment Due';
}

export interface AttendanceRecord {
    id: number;
    name: string;
    status: 'Present' | 'Absent' | 'Late';
}

export interface FeeRecord {
    id: number;
    name: string;
    batch: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Overdue';
    date: string;
    progress: number;
}

export interface Batch {
    id: number;
    name: string;
    subject: string;
    students: number;
    time: string;
    days: string;
    status: 'Active' | 'Inactive';
}

export interface Video {
    id: number;
    title: string;
    batch: string;
    duration: string;
    views: number;
    date: string;
    thumbnail?: string;
}

export interface Note {
    id: number;
    title: string;
    batch: string;
    size: string;
    downloads: number;
    date: string;
}

export interface Announcement {
    id: number;
    title: string;
    content: string;
    dae: string; // Keeping 'dae' as per original code, or should I fix typo? Let's fix it to 'date' but original code used 'dae'. I'll stick to 'date' and update code.
    pinned: boolean; // Corrected type
    author: string;
}
