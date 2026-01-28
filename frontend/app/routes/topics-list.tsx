import { SideBar } from "~/components/SideBar";
import { ProjectListItem } from "~/components/ProjectListItem";
import type { Route } from "../+types/root";
import { UserRole, useUser } from "~/contexts/UserContext";
import { useEffect, useState } from "react";
import { topicService, type Topic } from "~/services/topic.service";
import { exportService } from "~/services/export.service";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Dashboard() {
    const { hasRole } = useUser();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDownloadDialog, setShowDownloadDialog] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<
        "title-asc" | "title-desc" | "members-asc" | "members-desc" | null
    >(null);
    const [showOpenOnly, setShowOpenOnly] = useState(false);
    const [showApprovedOnly, setShowApprovedOnly] = useState(false);
    const [minMembers, setMinMembers] = useState<number | null>(null);
    const [maxMembers, setMaxMembers] = useState<number | null>(null);

    useEffect(() => {
        async function loadTopics() {
            try {
                setLoading(true);
                setError(null);
                const fetchedTopics = await topicService.getAllTopics();

                setTopics(fetchedTopics);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load topics",
                );
                console.error("Error loading topics:", err);
            } finally {
                setLoading(false);
            }
        }

        loadTopics();
    }, []);

    // Filter and sort topics
    const filteredTopics = topics
        .filter((topic) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesTitle = topic.title.toLowerCase().includes(query);
                const matchesSupervisor =
                    `${topic.supervisor.title} ${topic.supervisor.fullName}`
                        .toLowerCase()
                        .includes(query);
                if (!matchesTitle && !matchesSupervisor) return false;
            }

            // Open status filter
            if (showOpenOnly && !topic.isOpen) return false;

            // Approved status filter
            if (showApprovedOnly && topic.status !== "ZATWIERDZONY")
                return false;

            // Min members filter
            if (minMembers !== null && topic.team.length < minMembers)
                return false;

            // Max members filter
            if (maxMembers !== null && topic.team.length > maxMembers)
                return false;

            return true;
        })
        .sort((a, b) => {
            if (sortBy === "title-asc") {
                return a.title.localeCompare(b.title);
            }
            if (sortBy === "title-desc") {
                return b.title.localeCompare(a.title);
            }
            if (sortBy === "members-asc") {
                return a.team.length - b.team.length;
            }
            if (sortBy === "members-desc") {
                return b.team.length - a.team.length;
            }
            return 0;
        });

    const exportTeams = async () => {
        try {
            await exportService.exportStudentsByTopic();
            setShowDownloadDialog(false);
            setShowSuccessDialog(true);
        } catch (error) {
            setError("download error");
        }
    };

    const onDownloadClick = () => {
        setShowDownloadDialog(true);
    };

    return (
        <div className="">
            <nav>
                <button className="circle transparent">
                    <i>arrow_back</i>
                </button>
                <div className="max"></div>
                {hasRole(UserRole.Coordinator) && (
                    <button
                        className="circle transparent"
                        onClick={onDownloadClick}
                    >
                        <i>download</i>
                    </button>
                )}
                <button className="circle transparent">
                    <i>more_vert</i>
                </button>
            </nav>
            <h3>
                {hasRole(UserRole.Coordinator)
                    ? "Lista zespołów ZPI"
                    : "Lista tematów ZPI"}
            </h3>

            <nav className="wrap">
                <i>filter_list</i>
                <div className="field small prefix border-[.0625rem] border-(--outline-variant) round">
                    <i className="front">search</i>
                    <input
                        className="no-elevate"
                        placeholder="Szukaj..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div>
                    <button className="chip medium">
                        <span>
                            {sortBy
                                ? "Sortuj: " +
                                  (sortBy === "title-asc"
                                      ? "Nazwa ↑"
                                      : sortBy === "title-desc"
                                        ? "Nazwa ↓"
                                        : sortBy === "members-asc"
                                          ? "Liczba osób ↑"
                                          : "Liczba osób ↓")
                                : "Sortuj"}
                        </span>
                        <i>arrow_drop_down</i>
                    </button>
                    <menu className="">
                        <li onClick={() => setSortBy("title-asc")}>
                            <span>Nazwa ↑</span>
                        </li>
                        <li onClick={() => setSortBy("title-desc")}>
                            <span>Nazwa ↓</span>
                        </li>
                        <li onClick={() => setSortBy("members-asc")}>
                            <span>Liczba osób ↑</span>
                        </li>
                        <li onClick={() => setSortBy("members-desc")}>
                            <span>Liczba osób ↓</span>
                        </li>
                        {sortBy && <div className="divider"></div>}
                        {sortBy && (
                            <li onClick={() => setSortBy(null)}>
                                <i>clear</i>
                                <span>Wyczyść</span>
                            </li>
                        )}
                    </menu>
                </div>
                <button
                    className={`chip medium ${showOpenOnly ? "fill" : ""}`}
                    onClick={() => setShowOpenOnly(!showOpenOnly)}
                >
                    {showOpenOnly && <i>check</i>}
                    <span>Otwarty</span>
                </button>
                <button
                    className={`chip medium ${showApprovedOnly ? "fill" : ""}`}
                    onClick={() => setShowApprovedOnly(!showApprovedOnly)}
                >
                    {showApprovedOnly && <i>check</i>}
                    <span>Zatwierdzony</span>
                </button>
                <div>
                    <button className="chip medium">
                        <span>
                            {minMembers !== null
                                ? `Min: ${minMembers}`
                                : "Min liczba osób"}
                        </span>
                        <i>arrow_drop_down</i>
                    </button>
                    <menu className="">
                        <li onClick={() => setMinMembers(1)}>
                            <span>1</span>
                        </li>
                        <li onClick={() => setMinMembers(2)}>
                            <span>2</span>
                        </li>
                        <li onClick={() => setMinMembers(3)}>
                            <span>3</span>
                        </li>
                        <li onClick={() => setMinMembers(4)}>
                            <span>4</span>
                        </li>
                        <li onClick={() => setMinMembers(5)}>
                            <span>5</span>
                        </li>
                        {minMembers !== null && <div className="divider"></div>}
                        {minMembers !== null && (
                            <li onClick={() => setMinMembers(null)}>
                                <i>clear</i>
                                <span>Wyczyść</span>
                            </li>
                        )}
                    </menu>
                </div>
                <div>
                    <button className="chip medium">
                        <span>
                            {maxMembers !== null
                                ? `Max: ${maxMembers}`
                                : "Max liczba osób"}
                        </span>
                        <i>arrow_drop_down</i>
                    </button>
                    <menu className="">
                        <li onClick={() => setMaxMembers(1)}>
                            <span>1</span>
                        </li>
                        <li onClick={() => setMaxMembers(2)}>
                            <span>2</span>
                        </li>
                        <li onClick={() => setMaxMembers(3)}>
                            <span>3</span>
                        </li>
                        <li onClick={() => setMaxMembers(4)}>
                            <span>4</span>
                        </li>
                        <li onClick={() => setMaxMembers(5)}>
                            <span>5</span>
                        </li>
                        {maxMembers !== null && <div className="divider"></div>}
                        {maxMembers !== null && (
                            <li onClick={() => setMaxMembers(null)}>
                                <i>clear</i>
                                <span>Wyczyść</span>
                            </li>
                        )}
                    </menu>
                </div>
            </nav>

            <div className="space"></div>

            {loading && (
                <div className="center-align">
                    <progress className="circle wavy large"></progress>
                    <p>Ładowanie tematów...</p>
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

            {!loading && !error && topics.length === 0 && (
                <article className="border">
                    <i className="extra">info</i>
                    <div>
                        <h6>Brak tematów</h6>
                        <p>Nie znaleziono żadnych tematów.</p>
                    </div>
                </article>
            )}

            {!loading &&
                !error &&
                topics.length > 0 &&
                filteredTopics.length === 0 && (
                    <article className="border">
                        <i className="extra">info</i>
                        <div>
                            <h6>Brak wyników</h6>
                            <p>
                                Nie znaleziono tematów spełniających wybrane
                                kryteria.
                            </p>
                        </div>
                    </article>
                )}

            {!loading && !error && filteredTopics.length > 0 && (
                <ul className="list border medium-space">
                    {filteredTopics.map((topic) => (
                        <ProjectListItem
                            key={topic.id}
                            id={topic.id}
                            slots={
                                topic.team.length != null
                                    ? topic.team.length
                                    : 0
                            }
                            supervisor={`${topic.supervisor.title} ${topic.supervisor.fullName}`}
                            title={topic.title}
                        />
                    ))}
                </ul>
            )}

            {showDownloadDialog && (
                <>
                    <div
                        className="overlay blur active"
                        onClick={() => setShowDownloadDialog(false)}
                    ></div>
                    <dialog className="active">
                        <h5>Eksport zespołów</h5>
                        <br />
                        <div>Czy chcesz wyeksportować listę zespołów ZPI</div>
                        <nav className="right-align no-space">
                            <button
                                className="transparent link"
                                onClick={() => setShowDownloadDialog(false)}
                            >
                                Anuluj
                            </button>
                            <button
                                className="transparent link"
                                onClick={() => {
                                    exportTeams();
                                }}
                            >
                                Potwierdź
                            </button>
                        </nav>
                    </dialog>
                </>
            )}
            {showSuccessDialog && (
                <>
                    <div
                        className="overlay blur active"
                        onClick={() => setShowSuccessDialog(false)}
                    ></div>
                    <dialog className="active">
                        <h5>Podjęto próbę eksportu listy zespołów ZPI</h5>
                        <br />
                        <div>
                            Podjęto próbę eksportu listy zespołów ZPI w formacie
                            .xlsx na twoje urządzenie
                        </div>
                        <nav className="right-align no-space">
                            <button
                                className="transparent link"
                                onClick={() => setShowSuccessDialog(false)}
                            >
                                OK
                            </button>
                        </nav>
                    </dialog>
                </>
            )}
        </div>
    );
}
