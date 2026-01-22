export interface Declaration {
    id: number;
    status: string;
    submissionDate: string;
}

export interface Student {
    id: number | string;
    accountId?: number;
    fullName: string;
    studentIndex: string;
    avatar?: string;
    declaration?: Declaration | null;
    isDeclarationApproved?: boolean;
}

export interface Supervisor {
    id: number | string;
    accountId?: number;
    fullName: string;
    title: string;
    avatar?: string;
    position: string;
}

export type TopicStatus = "ZATWIERDZONY" | "ODRZUCONY" | "OCZEKUJACY";

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
    declaration?: Declaration | null;
}
export type PendingTopic = {
    id: number;
    title: string;
    description: string | null;
    status: string | null;
    topic_justification: string | null;
    creation_date: string;
    teacher_title: string;
    teacher_full_name: string;
    student_count: number;
};

export type PendingTopicsResponse = {
    count: number;
    topics: PendingTopic[];
};

class TopicService {
    private baseUrl = "http://localhost:5000/api/topics";

    async getSupervisor(): Promise<Supervisor> {
        const res = await fetch(`${this.baseUrl}/supervisor/me`);
        if (!res.ok) throw new Error("Failed to fetch supervisor");
        return res.json();
    }

    async getTopics(supervisorId: string): Promise<Topic[]> {
        const res = await fetch(
            `${this.baseUrl}?supervisor_id=${supervisorId}`,
        );
        if (!res.ok) throw new Error("Failed to fetch topics");
        return res.json();
    }

    async getAllTopics(): Promise<Topic[]> {
        const res = await fetch(this.baseUrl);
        if (!res.ok) throw new Error("Failed to fetch topics");
        return res.json();
    }

    async getTopic(id: string): Promise<Topic | undefined> {
        const res = await fetch(`${this.baseUrl}/${id}`);
        // Handle 404 naturally
        if (res.status === 404) return undefined;
        if (!res.ok) throw new Error("Failed to fetch topic");
        return res.json();
    }

    async createTopic(
        topic: Omit<
            Topic,
            "id" | "supervisor" | "status" | "isOpen" | "team" | "creationDate"
        >,
    ) {
        const res = await fetch(this.baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(topic),
        });
        if (!res.ok) throw new Error("Failed to create topic");
        return res.json();
    }

    async getPendingTopics(): Promise<PendingTopic[]> {
        try {
            const response = await fetch(`${this.baseUrl}/pending`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: PendingTopicsResponse = await response.json();
            return data.topics;
        } catch (error) {
            console.error("Error fetching pending topics:", error);
            throw error;
        }
    }

    async approveTopic(topicId: number): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${topicId}/approve`, {
                method: "PATCH",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error approving topic ${topicId}:`, error);
            throw error;
        }
    }

    async approveTopics(topicIds: number[]): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/approve-bulk`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ topic_ids: topicIds }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error approving topics in bulk:", error);
            throw error;
        }
    }

    async rejectTopic(topicId: number, rejectionReason: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${topicId}/reject`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ rejection_reason: rejectionReason }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error rejecting topic ${topicId}:`, error);
            throw error;
        }
    }

    async submitDeclaration(topicId: string, userId: number): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/${topicId}/declare`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: userId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error || `HTTP error! status: ${response.status}`,
                );
            }
        } catch (error) {
            console.error(
                `Error submitting declaration for topic ${topicId}:`,
                error,
            );
            throw error;
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
                student_count: 4,
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
                student_count: 4,
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
                student_count: 4,
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
                student_count: 3,
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
                student_count: 3,
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
                student_count: 5,
            },
        ];
    }
}

export const topicService = new TopicService();
