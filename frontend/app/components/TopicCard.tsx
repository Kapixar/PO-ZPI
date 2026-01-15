import type { PendingTopic } from "~/services/topic.service";

type TopicCardProps = {
    topic: PendingTopic;
}

export function TopicCard({ topic }: TopicCardProps) {
    const onClick = () => {
        alert("hello")
    }
    return (
        <div>
            <div>
                {topic.student_count}
            </div>

            <div>
                <p>
                    {topic.teacher_title} {topic.teacher_full_name}
                </p>
                <h6>
                    {topic.title}
                </h6>
            </div>

            <button type="button" onClick={onClick}>
                {"->"}
            </button>
            <div className="space"></div>
            <hr />
            <div className="space"></div>
            <div className="space"></div>
        </div>
    );
}