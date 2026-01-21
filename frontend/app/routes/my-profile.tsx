import { SideBar } from "~/components/SideBar";
import { CreateTopicDialog } from "~/components/CreateTopicDialog";
import { topicService, type Topic, type Supervisor } from "~/services/topic.service";
import { useEffect, useState } from "react";
import type { Route } from "./+types/my-profile";
import { Link, useNavigate } from "react-router";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Mój profil" },
    ];
}

export default function MyProfile() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const sup = await topicService.getSupervisor();
            setSupervisor(sup);
            const tops = await topicService.getTopics(sup.id);
            setTopics(tops);
        } catch (error) {
            console.error("Failed to fetch data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="flex h-screen bg-surface overflow-hidden">
            <SideBar />
            <main className="responsive max">
                <header>
                    <nav>
                        <button className="circle transparent" onClick={() => navigate(-1)}>
                            <i>arrow_back</i>
                        </button>
                        <div className="max">
                            <h5 className="no-margin">Mój profil</h5>
                        </div>
                        <button className="circle transparent">
                            <i>more_vert</i>
                        </button>
                    </nav>
                </header>

                <div className="padding">
                    <h5 className="mb-2">{supervisor ? `${supervisor.title} ${supervisor.firstName} ${supervisor.lastName}` : 'Ładowanie...'}</h5>
                    <div className="text-medium-emphasis mb-8">
                        {supervisor && (
                            <span>{supervisor.title} {supervisor.firstName} {supervisor.lastName}</span>
                        )}
                    </div>

                    <ul className="list medium-space">
                        {topics.length > 0 ? (
                            topics.map((topic, index) => (
                                <li key={topic.id}>
                                    <Link to={`/topic/${topic.id}`} className="row wave">
                                        <button className="circle tertiary">{index + 1}</button>
                                        <div className="max">
                                            <div className="small-text">{supervisor?.title} {supervisor?.firstName} {supervisor?.lastName}</div>
                                            <div className="text-medium">{topic.title}</div>
                                        </div>
                                        {topic.status === "OCZEKUJACY" && (
                                            <span style={{ color: "var(--error)" }}>Oczekuje na twoje zatwierdzenie</span>
                                        )}
                                        <i>arrow_forward</i>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <div className="center-align padding">
                                <p>Nie masz jeszcze żadnych tematów.</p>
                            </div>
                        )}
                    </ul>
                </div>

                <div className="fixed right bottom padding">
                    <button className="extended fab tertiary" onClick={() => setShowCreateDialog(true)}>
                        <i>add</i>
                        <span>Dodaj temat</span>
                    </button>
                </div>
            </main>

            {showCreateDialog && (
                <CreateTopicDialog
                    onClose={() => setShowCreateDialog(false)}
                    onCreated={fetchData}
                />
            )}
        </div>
    );
}
