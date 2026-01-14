
export interface Student {
    id: string; // index number
    firstName: string;
    lastName: string;
    avatar?: string;
}

export interface Supervisor {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    avatar?: string;
}

export type TopicStatus = 'ZATWIERDZONY' | 'ODRZUCONY' | 'OCZEKUJACY';

export interface Topic {
    id: string;
    title: string;
    description: string;
    supervisor: Supervisor;
    status: TopicStatus;
    isOpen: boolean;
    isStandard: boolean;
    team: Student[];
    maxMembers: number;
    creationDate: string;
}

const API_URL = 'http://localhost:5000/api'; // Adjust port if needed

export const TopicService = {
    getSupervisor: async (): Promise<Supervisor> => {
        const res = await fetch(`${API_URL}/topics/supervisor/me`);
        if (!res.ok) throw new Error('Failed to fetch supervisor');
        return res.json();
    },

    getTopics: async (supervisorId: string): Promise<Topic[]> => {
        const res = await fetch(`${API_URL}/topics?supervisor_id=${supervisorId}`);
        if (!res.ok) throw new Error('Failed to fetch topics');
        return res.json();
    },

    getTopic: async (id: string): Promise<Topic | undefined> => {
        const res = await fetch(`${API_URL}/topics/${id}`);
        // Handle 404 naturally
        if (res.status === 404) return undefined;
        if (!res.ok) throw new Error('Failed to fetch topic');
        return res.json();
    },

    createTopic: async (topic: Omit<Topic, 'id' | 'supervisor' | 'status' | 'isOpen' | 'team' | 'creationDate'>) => {
        const res = await fetch(`${API_URL}/topics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(topic)
        });
        if (!res.ok) throw new Error('Failed to create topic');
        return res.json();
    }
};