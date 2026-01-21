import { SideBar, type SideBarItem } from "~/components/SideBar";

import { useEffect, useState } from "react";
import { topicService, type PendingTopic } from "~/services/topic.service";
import { TopicCard } from "~/components/TopicCard";
import type { Route } from "../+types/root";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Dashboard() {
    const [topics, setTopics] = useState<PendingTopic[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getPending = async () => {
            try {
                const topics = topicService.getDemoPendingTopics();
                setTopics(topics)
            } catch (err) {
                setError("error occurred while loading topics")
            } finally {
                setLoading(false)
            }
        }
        getPending()
    }, [])

    const onArrowClick = (topic: PendingTopic) => {
        //logic with dialogs there
        alert("HELLO")
    }

    const standardTopics = topics.filter(t => t.student_count === 4);
    const nonStandardTopics = topics.filter(t => t.student_count !== 4);


    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <div className="">
            <SideBar />
            <main className=" rounded-2xl">
                <nav>
                    <button className="circle transparent">
                        <i>arrow_back</i>
                    </button>
                    <div className="max"></div>
                    <button className="circle transparent">
                        <i>more_vert</i>
                    </button>
                </nav>

                <h3>Tematy oczekujące na zatwierdzenie</h3>
                <div className="space"></div>

                <h5>Standardowe ({standardTopics.length})</h5>
                <div className="space"></div>

                {standardTopics.length > 0 ? (
                    <div>
                        {standardTopics.map(topic => (
                            <TopicCard
                                key={topic.id}
                                studentCount={topic.student_count}
                                teacher={topic.teacher_title + " " + topic.teacher_full_name}
                                title={topic.title}
                                onArrowClick={() => onArrowClick(topic)}
                            />
                        ))}
                    </div>
                ) : (
                    <p>Brak standardowych tematów</p>
                )}

                <div className="space"></div>

                <h5>Niestandardowe ({nonStandardTopics.length})</h5>
                <div className="space"></div>

                {nonStandardTopics.length > 0 ? (
                    <div>
                        {nonStandardTopics.map(topic => (
                            <TopicCard
                                key={topic.id}
                                studentCount={topic.student_count}
                                teacher={topic.teacher_title + " " + topic.teacher_full_name}
                                title={topic.title}
                                onArrowClick={() => onArrowClick(topic)}
                            />
                        ))}
                    </div>
                ) : (
                    <p>Brak niestandardowych tematów</p>
                )}

                <div className="space"></div>
            </main>
        </div>
    );
}