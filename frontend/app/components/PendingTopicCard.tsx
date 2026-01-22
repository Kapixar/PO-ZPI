
type TopicCardProps = {
    studentCount: number | null
    teacher: string | null
    title: string
    onArrowClick: () => void
}

export function PendingTopicCard({ studentCount, teacher, title, onArrowClick }: TopicCardProps) {
    return (
        <li>
            <button className="circle">{studentCount}</button>
            <div className="max">
                <div className="small">{teacher}</div>
                <div className="large">{title}</div>
            </div>
            <button type="button" onClick={onArrowClick}>
                <i>arrow_forward</i>
            </button>
        </li>
    );
}
