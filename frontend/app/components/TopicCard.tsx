import type { Topic } from "~/services/topic.service";
import { Link } from "react-router";

interface TopicCardProps {
    topic: Topic;
    index: number;
}

export function TopicCard({ topic, index }: TopicCardProps) {
    return (
        <article className="no-padding round surface-container-high mb-4">
            <Link to={`/topic/${topic.id}`} className="row wave p-4 text-inherit no-underline items-center">
                <div className="max-w-16 text-center">
                    <span className="circle large primary-container on-primary-container inline-flex items-center justify-center">
                        {topic.team.length}
                    </span>
                </div>
                <div className="max">
                    <div className="text-sm">
                        {topic.supervisor.title} {topic.supervisor.firstName} {topic.supervisor.lastName}
                    </div>
                    <div className="truncate text-base font-bold my-1">{topic.title}</div>
                </div>
                <div className="flex flex-col items-end gap-1 min-w-[150px]">
                    <span className="text-sm font-medium">
                        {topic.isStandard ? 'Standardowy' : 'Niestandardowy'}
                    </span>
                </div>
                <i className="ms-4">arrow_forward</i>
            </Link>
        </article>
    );
}
