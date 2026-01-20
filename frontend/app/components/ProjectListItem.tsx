interface ProjectItemProps {
    slots: number;
    supervisor: string;
    title: string;
}

export function ProjectListItem({
    slots,
    supervisor,
    title,
}: ProjectItemProps) {
    return (
        <li>
            <button className="circle">{slots}</button>
            <div className="max">
                <div className="small">{supervisor}</div>
                <div className="large">{title}</div>
            </div>
            <i>arrow_forward</i>
        </li>
    );
}
