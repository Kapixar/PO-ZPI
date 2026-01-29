import { SideBar } from "~/components/SideBar";
import { CreateTopicDialog } from "~/components/CreateTopicDialog";
import {
    topicService,
    type Topic,
    type Supervisor,
} from "~/services/topic.service";
import { useEffect, useState } from "react";
import type { Route } from "./+types/my-profile";
import { useNavigate } from "react-router";
import { TopicListItem } from "~/components/topic-list/ProjectListItem";
import { useUser } from "~/contexts/UserContext";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Mój profil" }];
}

// Pomocnicza funkcja do ustalania limitu na podstawie stanowiska
const getMaxTopics = (position: string = ""): number => {
    // Asystent: max 1 temat, Pozostali: max 2 tematy
    if (position === "ASYSTENT") return 1;
    return 2;
};

export default function MyProfile() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useUser();

    const fetchData = async () => {
        try {
            setLoading(true);
            const sup = await topicService.getSupervisor(user.user_id ?? 0);
            setSupervisor(sup);

            const tops = await topicService.getTopics(user.user_id ?? 0);
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
        <div>
            <header>
                <nav>
                    <button
                        className="circle transparent"
                        onClick={() => navigate(-1)}
                    >
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
                    {supervisor && `${supervisor.title} ${supervisor.fullName}`}
                </h5>
                <div className="text-medium-emphasis mb-8 row">
                    {supervisor && (
                        <>
                            <span>
                                {supervisor.title} {supervisor.fullName}
                            </span>
                            <div className="max"></div>
                            <span
                                className={`chip small ${isLimitReached ? "error" : "tertiary"}`}
                            >
                                Limit: {currentTopicCount} / {maxTopics}
                            </span>
                        </>
                    )}
                </div>

                <ul className="list border medium-space">
                    {!loading && topics.length > 0 ? (
                        topics.map((topic) => (
                            <TopicListItem
                                id={topic.id}
                                slots={topic.team ? topic.team.length : 0}
                                supervisor={`${supervisor?.title} ${supervisor?.fullName}`}
                                title={topic.title}
                            />
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
                    <button
                        className="extended fab tertiary"
                        data-ui="#create-topic-dialog"
                    >
                        <i>add</i>
                        <span>Dodaj temat</span>
                    </button>
                )}
            </div>

            <CreateTopicDialog onCreated={fetchData} supervisorId={user.user_id ?? 0} />
        </div>
    );
}
