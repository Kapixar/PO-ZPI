import { SideBar, type SideBarItem } from "~/components/SideBar";

import { useEffect, useState } from "react";
import { topicService, type PendingTopic } from "~/services/topic.service";
import { PendingTopicCard } from "~/components/PendingTopicCard";
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
    const [selectedStandardIds, setSelectedStandardIds] = useState<Set<number>>(new Set());


    const fetchPending = async () => {
        try {
            const topics = topicService.getDemoPendingTopics();
            setTopics(topics)
        } catch (err) {
            setError("error occurred while loading topics")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchPending()
    }, [])

    const onArrowClick = (topic: PendingTopic) => {
        //logic with dialogs there
        alert("HELLO")
    }

    const handleCheckboxChange = (topicId: number) => {
        setSelectedStandardIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(topicId)) {
                newSet.delete(topicId);
            } else {
                newSet.add(topicId);
            }
            return newSet;
        });
    }

    const handleApproveSelected = async () => {
        alert("HELLO")

        //logic with dialogs there

        //example code after confiramtion in dialog:
        /*try {
            const idsArray = Array.from(selectedStandardIds);
            await topicService.approveTopics(idsArray);
            setSelectedStandardIds(new Set());
            fetchPending()
        } catch (err) {
            setError("error while bulk approve")
        }
        */
    }


    const standardTopics = topics.filter(t => t.student_count === 4);
    const nonStandardTopics = topics.filter(t => t.student_count !== 4);


    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <div className="">
            <SideBar />
            <main className="rounded-2xl large-padding">
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

                <div className="row">
                    <h6>Standardowe ({standardTopics.length})</h6>
                    <div className="max"></div>
                    {selectedStandardIds.size > 0 && (
                        <button
                            className="fill"
                            onClick={handleApproveSelected}
                        >
                            Zatwierdź zaznaczone ({selectedStandardIds.size})
                        </button>
                    )}
                </div>
                <div className="space"></div>

                {standardTopics.length > 0 ? (
                    <ul className="list border medium-space">
                        {standardTopics.map(topic => (
                            <li key={topic.id}>
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedStandardIds.has(topic.id)}
                                        onChange={() => handleCheckboxChange(topic.id)}
                                    />
                                    <span></span>
                                </label>
                                <button className="circle">{topic.student_count}</button>
                                <div className="max">
                                    <div className="small">{topic.teacher_title + " " + topic.teacher_full_name}</div>
                                    <div className="large">{topic.title}</div>
                                </div>
                                <button type="button" onClick={() => onArrowClick(topic)}>
                                    <i>arrow_forward</i>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Brak standardowych tematów</p>
                )}

                <div className="space"></div>

                <h6>Niestandardowe ({nonStandardTopics.length})</h6>
                <div className="space"></div>

                {nonStandardTopics.length > 0 ? (
                    <ul className="list border medium-space">
                        {nonStandardTopics.map(topic => (
                            <PendingTopicCard
                                key={topic.id}
                                studentCount={topic.student_count}
                                teacher={topic.teacher_title + " " + topic.teacher_full_name}
                                title={topic.title}
                                onArrowClick={() => onArrowClick(topic)}
                            />
                        ))}
                    </ul>
                ) : (
                    <p>Brak niestandardowych tematów</p>
                )}

                <div className="space"></div>
            </main>
        </div>
    );
}