import { Link } from "react-router";

interface TopicItemProps {
    id: string;
    slots: number;
    supervisor: string;
    title: string;
}

export function TopicListItem({
    id,
    slots,
    supervisor,
    title,
}: TopicItemProps) {
    return (
        <li>
            <Link to={`/topic/${id}`} className="row wave">
                <button className="circle">{slots}</button>
                <div className="max">
                    <div className="small-text">{supervisor}</div>
                    <div className="text-medium">{title}</div>
                </div>
                <i>arrow_forward</i>
            </Link>
        </li>
    );
}
