
export type Topic = {
    id: number
    title: string
    description: string
    is_open: string
    creation_date: string
    teacher_id: number
    declaration_id: number
}

class TopicService {
    getDemoTopics(): Topic[] {
        return []
    }
}

export const topicService = new TopicService()