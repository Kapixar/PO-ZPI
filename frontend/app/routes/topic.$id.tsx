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
    index: string;
}

function TeamMember({ name, index }: TeamMemberProps) {
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
                <div className="medium-text">{index}</div>
            </div>
        </div>
    );
}

interface ApproveDialogProps {
    onConfirm: () => void;
    isSubmitting: boolean;
}

const ApproveDialog = ({ onConfirm, isSubmitting }: ApproveDialogProps) => {
    return (
        <dialog
            id="approve-declaration-dialog"
            className="middle-align center-align"
        >
            <div>
                <i className="extra">front_hand</i>
                <h5>Zatwierdzić deklarację ZPI?</h5>
                <p>
                    Zatwierdzenie tej akcji wiąże się ze zgodą na uczestnictwo w
                    projekcie ZPI z przypisaną grupą.
                </p>
                <nav className="right-align no-space">
                    <button
                        className="transparent link"
                        data-ui="#approve-declaration-dialog"
                        disabled={isSubmitting}
                    >
                        Cofnij
                    </button>
                    <button
                        className="transparent link"
                        onClick={onConfirm}
                        data-ui="#approve-declaration-dialog"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <progress className="circle small"></progress>
                        ) : (
                            "Zatwierdź"
                        )}
                    </button>
                </nav>
            </div>
        </dialog>
    );
};

export default function TopicDetail({ params }: Route.ComponentProps) {
    const { hasRole, user } = useUser();
    const navigate = useNavigate();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

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

    const isDeclarationApproved = submitSuccess;

    const handleSubmitDeclaration = async () => {
        if (!topic) return;

        if (!user.user_id) {
            setError("User ID not found. Please log in again.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await topicService.submitDeclaration(topic.id, user.user_id);
            setSubmitSuccess(true);

            const updatedTopic = await topicService.getTopic(params.id);
            if (updatedTopic) setTopic(updatedTopic);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to submit declaration",
            );
            console.error("Error submitting declaration:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="">
            <SideBar />
            <main className="rounded-2xl large-padding">
                <ApproveDialog
                    onConfirm={handleSubmitDeclaration}
                    isSubmitting={isSubmitting}
                />
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

                {submitSuccess && (
                    <article className="border">
                        <div>
                            <i className="extra">check_circle</i>
                            <h6>Sukces</h6>
                            <p>Deklaracja została pomyślnie złożona!</p>
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
                                index={topic.supervisor.title}
                            />
                            {topic.team.map((student) => (
                                <TeamMember
                                    key={student.id}
                                    name={`${student.firstName} ${student.lastName}`}
                                    index={student.studentIndex}
                                />
                            ))}
                        </div>

                        {hasRole(UserRole.Student, UserRole.Teacher) && (
                            <>
                                <h5>Zarządzanie</h5>

                                <nav className="group">
                                    <button
                                        className="fill small-round"
                                        disabled={isDeclarationApproved}
                                        data-ui="#approve-declaration-dialog"
                                    >
                                        <i>check_box</i>
                                        <span>Zatwierdź deklarację</span>
                                    </button>
                                    {hasRole(UserRole.Teacher) && (
                                        <>
                                            <button className="fill small-round">
                                                <i>format_size</i>
                                                <span>
                                                    Uzasadnij niestandardowy
                                                    rozmiar zespołu
                                                </span>
                                            </button>
                                            <button className="fill small-round">
                                                <i>group</i>
                                                <span>Zmień stan</span>
                                            </button>
                                        </>
                                    )}
                                </nav>
                            </>
                        )}

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
