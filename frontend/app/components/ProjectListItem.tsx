import { Link } from "react-router";

interface ProjectItemProps {
    id: string;
    slots: number;
    supervisor: string;
    title: string;
}

export function ProjectListItem({
    id,
    slots,
    supervisor,
    title,
}: ProjectItemProps) {
    return (
        <li>
            <Link to={`/topic/${id}`} className="row">
                <button className="circle">{slots}</button>
                <div className="max">
                    <div className="small">{supervisor}</div>
                    <div className="large">{title}</div>
                </div>
                <i>arrow_forward</i>
            </Link>
        </li>
    );
}
