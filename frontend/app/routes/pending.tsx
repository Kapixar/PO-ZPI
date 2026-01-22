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

    const [selectedTopic, setSelectedTopic] = useState<PendingTopic | null>(null);

    // --- View States ---
    const [isRejecting, setIsRejecting] = useState(false);
    const [showRejectSuccess, setShowRejectSuccess] = useState(false);

    // New states for Approval flow
    const [isApproving, setIsApproving] = useState(false);
    const [showApproveSuccess, setShowApproveSuccess] = useState(false);

    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectionError, setRejectionError] = useState(false);

    const [isBulkApproving, setIsBulkApproving] = useState(false);
    const [showBulkApproveSuccess, setShowBulkApproveSuccess] = useState(false);

    const fetchPending = async () => {
        try {
            setLoading(true);
            // This calls the Flask API -> Database
            const topics = await topicService.getPendingTopics();
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

    // --- Reset / Close Logic ---
    const resetDialogStates = () => {
        setIsRejecting(false);
        setShowRejectSuccess(false);
        setIsApproving(false);
        setShowApproveSuccess(false);
        setRejectionReason("");
        setRejectionError(false);
    }

    const onArrowClick = (topic: PendingTopic) => {
        resetDialogStates();
        setSelectedTopic(topic);
    }

    const closeDialog = () => {
        resetDialogStates();
        setSelectedTopic(null);
    }

    const handleCloseSuccessAndRefresh = () => {
        closeDialog();
        fetchPending();
    }

    // Switch to rejection view
    const handleStartRejection = () => {
        setIsRejecting(true);
    }

    // Go back to details view
    const handleCancelRejection = () => {
        setIsRejecting(false);
        setRejectionError(false);
    }

    const handleConfirmRejection = async () => {
        if (!rejectionReason.trim()) {
            setRejectionError(true);
            return;
        }
        if (!selectedTopic) return;

        try {
            // --- REAL SERVICE CALL ---
            // Assuming rejectTopic takes (id, reason)
            await topicService.rejectTopic(selectedTopic.id, rejectionReason);

            setIsRejecting(false);
            setShowRejectSuccess(true);
            // We do NOT fetchPending() here yet. We wait for the user to click "OK" 
            // in handleCloseSuccessAndRefresh to avoid the UI jumping.
        } catch (e) {
            console.error(e);
            alert("Błąd podczas odrzucania tematu.");
        }
    }

    // --- Approval Logic ---
    const handleStartApprove = () => {
        setIsApproving(true);
    }

    const handleCancelApprove = () => {
        setIsApproving(false);
    }

    const handleConfirmApprove = async () => {
        if (!selectedTopic) return;
        try {
            // --- REAL SERVICE CALL ---
            // Passing single ID as an array to reuse the bulk endpoint, 
            // or use approveTopic(id) if your service has a specific single method.
            await topicService.approveTopics([selectedTopic.id]);

            setIsApproving(false);
            setShowApproveSuccess(true);
        } catch (e) {
            console.error(e);
            alert("Błąd podczas zatwierdzania tematu.");
        }
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

    // 1. Trigger Bulk Dialog
    const handleApproveSelected = () => {
        if (selectedStandardIds.size === 0) return;
        setIsBulkApproving(true);
    }

    // 2. Cancel Bulk Dialog
    const handleCancelBulk = () => {
        setIsBulkApproving(false);
    }

    // 3. Confirm Bulk Action
    const handleConfirmBulkApprove = async () => {
        try {
            const idsArray = Array.from(selectedStandardIds);
            await topicService.approveTopics(idsArray);

            setIsBulkApproving(false);
            setShowBulkApproveSuccess(true);
        } catch (err) {
            console.error(err);
            alert("Błąd podczas grupowego zatwierdzania.");
        }
    }

    // 4. Close Bulk Success and Refresh
    const handleCloseBulkSuccess = () => {
        setShowBulkApproveSuccess(false);
        setSelectedStandardIds(new Set()); // Clear selection
        fetchPending();
    }


    const standardTopics = topics.filter(t => t.student_count === 4);
    const nonStandardTopics = topics.filter(t => t.student_count !== 4);

    const selectedTopicsList = standardTopics.filter(t => selectedStandardIds.has(t.id));

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

            {/* --- DIALOGS --- */}
            {selectedTopic && (
                <>
                    <div className="overlay blur active" onClick={closeDialog}></div>

                    {/* 1. APPROVAL SUCCESS VIEW */}
                    {showApproveSuccess ? (
                        <dialog className="active medium-width modal">
                            <div className="padding">
                                <i className="extra">fact_check</i>
                                <div className="space"></div>
                                <h5>Zatwierdzono temat</h5>
                                <div className="space"></div>

                                {/* Display the Title so they know WHICH topic was approved */}
                                <p className="large-text bold">{selectedTopic.title}</p>

                                <div className="space"></div>

                                {/* Display the Real Description here */}
                                <p className="small-text">
                                    {selectedTopic.description || "Brak opisu tematu."}
                                </p>
                            </div>
                            <nav className="center-align padding">
                                <button className="transparent red-text" onClick={handleCloseSuccessAndRefresh}>
                                    OK
                                </button>
                            </nav>
                        </dialog>

                        /* 2. APPROVAL CONFIRMATION VIEW */
                    ) : isApproving ? (
                        <dialog className="active medium-width modal">
                            <div className="padding">
                                <i className="extra">fact_check</i>
                                <div className="space"></div>
                                <h5>Czy na pewno chcesz potwierdzić temat?</h5>
                                <div className="space"></div>
                                <p>
                                    Jest to temat {selectedTopic.student_count === 4 ? "standardowy" : "niestandardowy"}: <br />
                                    <b>{selectedTopic.title}</b>
                                </p>
                            </div>
                            <nav className="center-align padding no-space">
                                <button className="transparent" onClick={handleCancelApprove}>
                                    Cofnij
                                </button>
                                <div className="space"></div>
                                <button className="fill pink" onClick={handleConfirmApprove}>
                                    Potwierdzam
                                </button>
                            </nav>
                        </dialog>

                        /* 3. REJECTION SUCCESS VIEW */
                    ) : showRejectSuccess ? (
                        <dialog className="active medium-width modal">
                            <div className="padding center-align">
                                <i className="extra">cancel</i>
                                <div className="space"></div>
                                <h5>Odrzucono temat</h5>
                                <div className="space"></div>
                            </div>
                            <div className="padding">
                                <p className="large-text">{selectedTopic.title}</p>
                                <div className="space"></div>
                                <div className="small-text bold">Uzasadnienie:</div>
                                <p>{rejectionReason}</p>
                            </div>
                            <nav className="right-align padding">
                                <button className="transparent red-text" onClick={handleCloseSuccessAndRefresh}>
                                    OK
                                </button>
                            </nav>
                        </dialog>

                        /* 4. REJECTION INPUT VIEW */
                    ) : isRejecting ? (
                        <dialog className="active medium modal center-align rounded-2xl">
                            <div className="padding">
                                <div className="center-align">
                                    <i className="extra">cancel</i>
                                </div>
                                <div className="space"></div>
                                <h5>Uzasadnij powód odrzucenia tematu</h5>
                                <div className="space"></div>
                                <div className={`field textarea border fill round ${rejectionError ? "invalid" : ""}`}>
                                    <textarea
                                        placeholder="Uzasadnienie odrzucenia"
                                        value={rejectionReason}
                                        onChange={(e) => {
                                            setRejectionReason(e.target.value);
                                            if (e.target.value.trim()) setRejectionError(false);
                                        }}
                                        rows={3}
                                    ></textarea>
                                    {rejectionError && (
                                        <span className="error red-text">Uzasadnienie nie powinno być puste!</span>
                                    )}
                                </div>
                            </div>
                            <nav className="center-align padding no-space">
                                <button className="transparent" onClick={handleCancelRejection}>
                                    Cofnij
                                </button>
                                <div className="space"></div>
                                <button className="fill pink" onClick={handleConfirmRejection}>
                                    Zatwierdź odrzucenie
                                </button>
                            </nav>
                        </dialog>

                        /* 5. DEFAULT DETAILS VIEW */
                    ) : (
                        <dialog className="active medium-width modal">
                            <header className="fixed">
                                <nav>
                                    <button className="circle transparent" onClick={closeDialog}>
                                        <i>arrow_back</i>
                                    </button>
                                    <h5 className="max">
                                        {selectedTopic.student_count === 4 ? "Zatwierdź temat" : "Zatwierdź temat niestandardowy"}
                                    </h5>
                                    <button className="circle transparent">
                                        <i>more_vert</i>
                                    </button>
                                </nav>
                            </header>

                            <div className="padding">
                                <div className="space"></div>
                                <div className="field">
                                    <label className="bold">Temat zespołu</label>
                                    <div className="row">
                                        <span className="max underline">{selectedTopic.title}</span>
                                        <i>link</i>
                                    </div>
                                </div>
                                <div className="space"></div>
                                <div className="field">
                                    <label className="bold">Wnioskujący prowadzący</label>
                                    <div>{selectedTopic.teacher_title} {selectedTopic.teacher_full_name}</div>
                                </div>
                                <div className="space"></div>
                                <div className="field">
                                    <label className="bold">Rozmiar zespołu</label>
                                    <div>{selectedTopic.student_count}</div>
                                </div>

                                {selectedTopic.student_count !== 4 && (
                                    <>
                                        <div className="space"></div>
                                        <div className="field">
                                            <label className="bold">Uzasadnienie niestandardowego rozmiaru</label>
                                            <p className="small-text">{selectedTopic.topic_justification}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <nav className="right-align padding">
                                <button className="transparent border-error red-text" onClick={handleStartRejection}>
                                    Odrzuć
                                </button>
                                <button className="fill pink" onClick={handleStartApprove}>
                                    Zatwierdź
                                </button>
                            </nav>
                        </dialog>
                    )}
                </>
            )}

            {/* --- BULK ACTIONS DIALOGS --- */}

            {/* 1. Bulk Confirmation */}
            {isBulkApproving && (
                <>
                    <div className="overlay blur active" onClick={handleCancelBulk}></div>
                    <dialog className="active medium modal center-align rounded-2xl">
                        <div className="padding">
                            <i className="extra">fact_check</i>
                            <div className="space"></div>
                            <h5>Czy chcesz potwierdzić zaznaczone {selectedStandardIds.size} tematy?</h5>
                            <div className="space"></div>

                            {/* List selected titles neatly */}
                            <div className="small-text left-align grey-text">
                                {selectedTopicsList.map(t => t.title).join(", ")}
                                {selectedTopicsList.length > 5 && "..."}
                            </div>
                        </div>
                        <nav className="center-align padding no-space">
                            <button className="transparent" onClick={handleCancelBulk}>
                                Cofnij
                            </button>
                            <div className="space"></div>
                            <button className="fill pink" onClick={handleConfirmBulkApprove}>
                                Potwierdź
                            </button>
                        </nav>
                    </dialog>
                </>
            )}

            {/* 2. Bulk Success */}
            {showBulkApproveSuccess && (
                <>
                    <div className="overlay blur active" onClick={handleCloseBulkSuccess}></div>
                    <dialog className="active medium modal center-align rounded-2xl">
                        <div className="padding">
                            <i className="extra">fact_check</i>
                            <div className="space"></div>
                            <h5>Zatwierdzono {selectedTopicsList.length} tematy</h5>
                            <div className="space"></div>

                            <div className="small-text left-align grey-text">
                                {selectedTopicsList.map(t => t.title).join(", ")}
                            </div>
                        </div>
                        <nav className="center-align padding">
                            <button className="transparent red-text" onClick={handleCloseBulkSuccess}>
                                OK
                            </button>
                        </nav>
                    </dialog>
                </>
            )}

        </div>
    );
}