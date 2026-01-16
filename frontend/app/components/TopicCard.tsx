type TopicCardProps = {
    studentCount: number | null
    teacher: string | null
    title: string
    onArrowClick: () => void
}

export function TopicCard({ studentCount, teacher, title, onArrowClick }: TopicCardProps) {
    return (
        <div>
            <div>
                {studentCount}
            </div>

            <div>
                <p>
                    {teacher}
                </p>
                <h6>
                    {title}
                </h6>
            </div>

            <button type="button" onClick={onArrowClick}>
                {"->"}
            </button>
            <div className="space"></div>
            <hr />
            <div className="space"></div>
            <div className="space"></div>
        </div>
    );
}
