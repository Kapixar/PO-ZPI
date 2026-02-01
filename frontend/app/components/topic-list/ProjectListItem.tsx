import { Link } from "react-router";

interface TopicItemProps {
    id: string;
    slots: number;
    supervisor: string;
    title: string;
    badge: boolean;
}

export function TopicListItem({
    id,
    slots,
    supervisor,
    title,
    badge,
}: TopicItemProps) {
    return (
        <li>
            <Link to={`/topic/${id}`} className="row wave">
                {badge && <span className="badge no-round">Twój temat</span>}
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
