import type { Route } from "./+types/topic.$id";
import { UserRole, useUser } from "~/contexts/UserContext";
import { useEffect, useState } from "react";
import { topicService, type Topic } from "~/services/topic.service";
import { useNavigate } from "react-router";
import { ApproveDeclarationDialog } from "~/components/topic-details/DeclarationApproveDialog";
import { TeamMember } from "~/components/topic-details/TeamMember";
import { NotificationBox } from "~/components/NotificationBox";
import { TopicManagement } from "~/components/topic-details/TopicManagement";
import { TopicInformation } from "~/components/topic-details/TopicInformation";
import { LoadingInformation } from "~/components/LoadingInformation";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Szczegóły tematu" },
        { name: "description", content: "Szczegóły tematu ZPI" },
    ];
}

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

    const currentTeamMemberUser = topic?.team.find((member) => {
        if (!user.user_id) return false;

        const memberAccountId = member.accountId;
        const memberIdNumber =
            typeof member.id === "string" ? Number(member.id) : member.id;
        return (
            memberAccountId === user.user_id || memberIdNumber === user.user_id
        );
    });

    const isSupervisor = Boolean(
        user.user_id &&
        topic?.supervisor &&
        (topic.supervisor.accountId === user.user_id ||
            (typeof topic.supervisor.id === "string"
                ? Number(topic.supervisor.id)
                : topic.supervisor.id) === user.user_id),
    );

    const isUserTeamMember =
        Boolean(currentTeamMemberUser) ||
        (hasRole(UserRole.Teacher) && isSupervisor);

    const isDeclarationApproved =
        submitSuccess ||
        Boolean(currentTeamMemberUser?.isDeclarationApproved) ||
        currentTeamMemberUser?.declaration?.status === "ZLOZONA" ||
        (isSupervisor && topic?.declaration?.status === "ZLOZONA");

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
        <div>
            <ApproveDeclarationDialog
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

            {loading && <LoadingInformation message="Ładowanie tematu..." />}

            {error && <NotificationBox message={error} isError={true} />}

            {submitSuccess && (
                <NotificationBox message="Deklaracja została pomyślnie złożona!" />
            )}

            {!loading && !error && topic && (
                <>
                    <h3>{topic.title}</h3>

                    <p>{topic.description}</p>

                    <h5>Zespół</h5>
                    <div className="flex flex-row gap-10">
                        <TeamMember
                            name={`${topic.supervisor.fullName}`}
                            index={topic.supervisor.title}
                            isStudent={false}
                            showDeclarationLack={
                                isUserTeamMember && !isDeclarationApproved
                            }
                        />
                        {topic.team.map((student) => (
                            <TeamMember
                                key={student.id}
                                name={`${student.fullName}`}
                                index={student.studentIndex}
                                isStudent={true}
                                showDeclarationLack={
                                    isUserTeamMember &&
                                    !student.isDeclarationApproved
                                }
                            />
                        ))}
                    </div>

                    <TopicManagement
                        isSupervisor={isSupervisor}
                        isUserTeamMember={isUserTeamMember}
                        isDeclarationApproved={isDeclarationApproved}
                    />

                    <TopicInformation topic={topic} />
                </>
            )}
        </div>
    );
}
