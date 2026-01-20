import { SideBar } from "~/components/SideBar";
import type { Route } from "./+types/topic.$id";
import { UserRole, useUser } from "~/contexts/UserContext";
import { useEffect, useState } from "react";
import { topicService, type Topic } from "~/services/topic.service";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Szczegóły tematu" },
        { name: "description", content: "Szczegóły tematu ZPI" },
    ];
}

interface TeamMemberProps {
    name: string;
    role: string;
}

function TeamMember({ name, role }: TeamMemberProps) {
    return (
        <div>
            <i
                style={{ "--_size": "7rem" } as React.CSSProperties}
                className="fill"
            >
                face
            </i>
            <div className="center-align">
                <h6 className="small bold">{name}</h6>
                <div className="medium-text">{role}</div>
            </div>
        </div>
    );
}

const ApproveDialog = () => {
    return (
        <dialog
            id="approve-declaration-dialog"
            className="middle-align center-align"
        >
            <div>
                <i className="extra">front_hand</i>
                <h5>Zatwierdzić deklarację ZPI?</h5>
                <p>
                    Zatwierdzenie tej akcji wiąże się ze zgodą na uczestnictwo z
                    projekcie ZPI z przypisaną grupą.
                </p>
                <nav className="right-align no-space">
                    <button className="transparent link">Cofnij</button>
                    <button className="transparent link">Zatwierdź</button>
                </nav>
            </div>
        </dialog>
    );
};

export default function TopicDetail({ params }: Route.ComponentProps) {
    const { hasRole } = useUser();
    const navigate = useNavigate();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTopic() {
            try {
                setLoading(true);
                setError(null);
                const fetchedTopic = await topicService.getTopic(params.id);
                if (!fetchedTopic) {
                    setError("Nie znaleziono tematu");
                } else {
                    setTopic(fetchedTopic);
                }
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "Failed to load topic",
                );
                console.error("Error loading topic:", err);
            } finally {
                setLoading(false);
            }
        }

        loadTopic();
    }, [params.id]);

    const isDeclarationApproved = false;

    return (
        <div className="">
            <SideBar />
            <main className="rounded-2xl large-padding">
                <ApproveDialog />
                <nav>
                    <button
                        className="circle transparent"
                        onClick={() => navigate(-1)}
                    >
                        <i>arrow_back</i>
                    </button>
                    <div className="max"></div>
                    <button className="circle transparent">
                        <i>more_vert</i>
                    </button>
                </nav>

                {loading && (
                    <div className="center-align">
                        <progress className="circle wavy large"></progress>
                        <p>Ładowanie tematu...</p>
                    </div>
                )}

                {error && (
                    <article className="border error">
                        <div>
                            <i className="extra">error</i>
                            <h6>Błąd</h6>
                            <p>{error}</p>
                        </div>
                    </article>
                )}

                {!loading && !error && topic && (
                    <>
                        <h3>{topic.title}</h3>

                        <p>{topic.description}</p>

                        <h5>Zespół</h5>
                        <div className="flex flex-row gap-10">
                            <TeamMember
                                name={`${topic.supervisor.firstName} ${topic.supervisor.lastName}`}
                                role={topic.supervisor.title}
                            />
                            {topic.team.map((student) => (
                                <TeamMember
                                    key={student.id}
                                    name={`${student.firstName} ${student.lastName}`}
                                    role={student.id}
                                />
                            ))}
                        </div>

                        <h5>Zarządzanie</h5>

                        <nav className="group">
                            {hasRole(UserRole.Student, UserRole.Supervisor) && (
                                <button
                                    className="fill small-round"
                                    disabled={isDeclarationApproved}
                                    data-ui="#approve-declaration-dialog"
                                >
                                    <i>check_box</i>
                                    <span>Zatwierdź deklarację</span>
                                </button>
                            )}
                            {!topic.isStandard && (
                                <button className="fill small-round">
                                    <i>format_size</i>
                                    <span>
                                        Uzasadnij niestandardowy rozmiar zespołu
                                    </span>
                                </button>
                            )}
                            <button className="fill small-round">
                                <i>group</i>
                                <span>Zmień stan</span>
                            </button>
                        </nav>

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
                                    <h6 className="small">
                                        Liczba członków zespołu
                                    </h6>
                                    <div>
                                        {topic.team.length} / {topic.maxMembers}
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="max">
                                    <h6 className="small">
                                        Data utworzenia tematu
                                    </h6>
                                    <div>
                                        {new Date(
                                            topic.creationDate,
                                        ).toLocaleDateString("pl-PL")}
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </>
                )}
            </main>
        </div>
    );
}
