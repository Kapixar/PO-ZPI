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

// Pomocnicza funkcja do ustalania limitu na podstawie stanowiska
const getMaxTopics = (position: string = ""): number => {
    // Asystent: max 1 temat, Pozostali: max 2 tematy
    if (position === "ASYTSTENT") return 1;
    return 2;
};

export default function MyProfile() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            setLoading(true);
            const sup = await topicService.getSupervisor();
            setSupervisor(sup);
            
            const tops = await topicService.getTopics(sup.id);
            setTopics(tops);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- LOGIKA LIMITÓW ---
    const maxTopics = supervisor ? getMaxTopics(supervisor.position) : 2;
    const currentTopicCount = topics.length;
    const isLimitReached = currentTopicCount >= maxTopics;

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
                    {/* Dane prowadzącego */}
                    <h5 className="mb-2">
                        {supervisor ? `${supervisor.title} ${supervisor.firstName} ${supervisor.lastName}` : 'Ładowanie...'}
                    </h5>
                    <div className="text-medium-emphasis mb-8 row">
                        {supervisor && (
                            <>
                                <span>{supervisor.title} {supervisor.firstName} {supervisor.lastName}</span>
                                <div className="max"></div>
                                <span className={`chip small ${isLimitReached ? "error" : "tertiary"}`}>
                                    Limit: {currentTopicCount} / {maxTopics}
                                </span>
                            </>
                        )}
                    </div>

                    <ul className="list medium-space">
                        {!loading && topics.length > 0 ? (
                            topics.map((topic) => (
                                <li key={topic.id}>
                                    <Link to={`/topic/${topic.id}`} className="row wave">
                                        <button className="circle tertiary">
                                            {topic.team ? topic.team.length : 0}
                                        </button>
                                        
                                        <div className="max">
                                            <div className="small-text">
                                                {supervisor?.title} {supervisor?.firstName} {supervisor?.lastName}
                                            </div>
                                            <div className="text-medium">{topic.title}</div>
                                        </div>
                                        
                                        <i>arrow_forward</i>
                                    </Link>
                                </li>
                            ))
                        ) : !loading ? (
                            <div className="center-align padding">
                                <p>Nie masz jeszcze żadnych tematów.</p>
                            </div>
                        ) : (
                            <div className="center-align padding">
                                <progress className="circle"></progress>
                            </div>
                        )}
                    </ul>
                </div>

                {/* Przycisk dodawania (FAB) */}
                <div className="fixed right bottom padding">
                    {isLimitReached ? (
                        <button className="extended fab error" disabled>
                            <i>block</i>
                            <span>Limit osiągnięty</span>
                        </button>
                    ) : (
                        <button className="extended fab tertiary" onClick={() => setShowCreateDialog(true)}>
                            <i>add</i>
                            <span>Dodaj temat</span>
                        </button>
                    )}
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