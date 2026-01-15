
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
export type PendingTopic = {
    id: number
    title: string
    description: string | null
    status: string | null
    topic_justification: string | null
    creation_date: string
    teacher_title: string
    teacher_full_name: string
    student_count: number
}

export type PendingTopicsResponse = {
    count: number
    topics: PendingTopic[]
}

class TopicService {
    private baseUrl = 'http://localhost:5000/api/topics'


    async getPendingTopics(): Promise<PendingTopic[]> {
        try {
            const response = await fetch(`${this.baseUrl}/pending`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: PendingTopicsResponse = await response.json()
            return data.topics

        } catch (error) {
            console.error('Error fetching pending topics:', error)
            throw error
        }
    }

    getDemoPendingTopics(): PendingTopic[] {
        return [
            // Standardowe (4 studentów)
            {
                id: 1,
                title: "Analiza algorytmów sortowania w różnych strukturach danych",
                description: "Badanie efektywności",
                status: "Oczekujący",
                topic_justification: null,
                creation_date: "2025-01-14T10:30:00",
                teacher_title: "dr",
                teacher_full_name: "Jan Kowalski",
                student_count: 4
            },
            {
                id: 2,
                title: "Systemy rozproszone w chmurze obliczeniowej",
                description: "Analiza wydajności",
                status: "Oczekujący",
                topic_justification: null,
                creation_date: "2025-01-14T11:00:00",
                teacher_title: "prof. dr hab.",
                teacher_full_name: "Anna Nowak",
                student_count: 4
            },
            {
                id: 3,
                title: "Bezpieczeństwo aplikacji webowych",
                description: "Analiza zagrożeń",
                status: "Oczekujący",
                topic_justification: null,
                creation_date: "2025-01-14T12:00:00",
                teacher_title: "dr",
                teacher_full_name: "Jan Kowalski",
                student_count: 4
            },

            // Niestandardowe 
            {
                id: 4,
                title: "Machine Learning w medycynie - projekt indywidualny",
                description: "Zastosowanie ML",
                status: "Oczekujący",
                topic_justification: "Innowacyjne",
                creation_date: "2025-01-14T13:00:00",
                teacher_title: "dr inż.",
                teacher_full_name: "Piotr Wiśniewski",
                student_count: 3
            },
            {
                id: 5,
                title: "Blockchain i kryptowaluty - badania grupowe",
                description: "Analiza technologii blockchain",
                status: "Oczekujący",
                topic_justification: "Perspektywiczne",
                creation_date: "2025-01-14T14:00:00",
                teacher_title: "prof. dr hab.",
                teacher_full_name: "Anna Nowak",
                student_count: 3
            },
            {
                id: 6,
                title: "Sztuczna inteligencja w grach komputerowych",
                description: "Implementacja AI",
                status: "Oczekujący",
                topic_justification: "Ciekawy temat",
                creation_date: "2025-01-14T15:00:00",
                teacher_title: "dr",
                teacher_full_name: "Maria Zielińska",
                student_count: 5
            },
        ]
    }
}
export const topicService = new TopicService()
