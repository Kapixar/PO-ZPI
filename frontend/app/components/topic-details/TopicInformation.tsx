import type { Topic } from "~/services/topic.service";
import { formatDate } from "~/utility/util";

interface TopicInformationProps {
    topic: Topic;
}

export function TopicInformation({ topic }: TopicInformationProps) {
    return (
        <>
            <h5>Informacje</h5>
            <ul className="list border">
                <li>
                    <div className="max">
                        <h6 className="small">Stan zespołu</h6>
                        <div>
                            {topic.isOpen
                                ? "Oczekuje na nowych członków"
                                : "Zespół kompletny"}
                        </div>
                    </div>
                </li>
                <li>
                    <div className="max">
                        <h6 className="small">Status tematu</h6>
                        <div>{topic.status}</div>
                    </div>
                </li>
                <li>
                    <div className="max">
                        <h6 className="small">Liczba członków zespołu</h6>
                        <div>{topic.team.length}</div>
                    </div>
                </li>
                <li>
                    <div className="max">
                        <h6 className="small">Data utworzenia tematu</h6>
                        <div>{formatDate(topic.creationDate)}</div>
                    </div>
                </li>
            </ul>
        </>
    );
}
