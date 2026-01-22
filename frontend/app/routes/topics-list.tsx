import { SideBar } from "~/components/SideBar";
import { ProjectListItem } from "~/components/ProjectListItem";
import type { Route } from "../+types/root";
import { UserRole, useUser } from "~/contexts/UserContext";
import { useEffect, useState } from "react";
import { topicService, type Topic } from "~/services/topic.service";
import ExportService from '~/services/export.service';


export function meta({ }: Route.MetaArgs) {
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

    // Filter states
    const [sortBy, setSortBy] = useState<"date" | "title" | null>(null);
    const [showOpenOnly, setShowOpenOnly] = useState(false);
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
            if (showOpenOnly && !topic.isOpen) return false;
            if (minMembers !== null && topic.maxMembers < minMembers)
                return false;
            if (maxMembers !== null && topic.maxMembers > maxMembers)
                return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "date") {
                return (
                    new Date(b.creationDate).getTime() -
                    new Date(a.creationDate).getTime()
                );
            }
            if (sortBy === "title") {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });


    const onDownloadClick = async () => {
        try {
            await ExportService.exportStudentsByTopic();

        } catch (error) {
            setError("download error")
        }
    }

    return (
        <div className="">
            <SideBar />
            <main className="rounded-2xl large-padding">
                <nav>
                    <button className="circle transparent">
                        <i>arrow_back</i>
                    </button>
                    <div className="max"></div>
                    {hasRole(UserRole.Coordinator) && (
                        <button className="circle transparent" onClick={onDownloadClick}>
                            <i>download</i>
                        </button>
                    )}
                    <button className="circle transparent">
                        <i>more_vert</i>
                    </button>
                </nav>
                <h3>Lista tematów ZPI</h3>

                {/* Sort Menu */}
                <menu className="no-wrap">
                    <a data-ui="#sort-menu">
                        <i>arrow_drop_down</i>
                    </a>
                    <div id="sort-menu" className="menu">
                        <a onClick={() => setSortBy(null)}>
                            <i>{sortBy === null ? "check" : ""}</i>
                            <span>Domyślnie</span>
                        </a>
                        <a onClick={() => setSortBy("date")}>
                            <i>{sortBy === "date" ? "check" : ""}</i>
                            <span>Data utworzenia</span>
                        </a>
                        <a onClick={() => setSortBy("title")}>
                            <i>{sortBy === "title" ? "check" : ""}</i>
                            <span>Tytuł</span>
                        </a>
                    </div>
                </menu>

                {/* Min Members Menu */}
                <menu className="no-wrap">
                    <a data-ui="#min-menu">
                        <i>arrow_drop_down</i>
                    </a>
                    <div id="min-menu" className="menu">
                        <a onClick={() => setMinMembers(null)}>
                            <i>{minMembers === null ? "check" : ""}</i>
                            <span>Wszystkie</span>
                        </a>
                        {[3, 4, 5].map((num) => (
                            <a key={num} onClick={() => setMinMembers(num)}>
                                <i>{minMembers === num ? "check" : ""}</i>
                                <span>Min {num} osób</span>
                            </a>
                        ))}
                    </div>
                </menu>

                {/* Max Members Menu */}
                <menu className="no-wrap">
                    <a data-ui="#max-menu">
                        <i>arrow_drop_down</i>
                    </a>
                    <div id="max-menu" className="menu">
                        <a onClick={() => setMaxMembers(null)}>
                            <i>{maxMembers === null ? "check" : ""}</i>
                            <span>Wszystkie</span>
                        </a>
                        {[3, 4, 5].map((num) => (
                            <a key={num} onClick={() => setMaxMembers(num)}>
                                <i>{maxMembers === num ? "check" : ""}</i>
                                <span>Max {num} osób</span>
                            </a>
                        ))}
                    </div>
                </menu>

                <nav className="scroll ground">
                    <button
                        className={`chip ${sortBy !== null ? "fill" : ""}`}
                        data-ui="#sort-menu"
                    >
                        {sortBy === null
                            ? "Sortuj"
                            : sortBy === "date"
                                ? "Data"
                                : "Tytuł"}
                    </button>
                    <button
                        className={`chip ${showOpenOnly ? "fill" : ""}`}
                        onClick={() => setShowOpenOnly(!showOpenOnly)}
                    >
                        Otwarty
                    </button>
                    <button
                        className={`chip ${minMembers !== null ? "fill" : ""}`}
                        data-ui="#min-menu"
                    >
                        {minMembers !== null
                            ? `Min ${minMembers} osób`
                            : "Min liczba osób"}
                    </button>
                    <button
                        className={`chip ${maxMembers !== null ? "fill" : ""}`}
                        data-ui="#max-menu"
                    >
                        {maxMembers !== null
                            ? `Max ${maxMembers} osób`
                            : "Max liczba osób"}
                    </button>
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
                                slots={topic.maxMembers != null ? topic.maxMembers : 0}
                                supervisor={`${topic.supervisor.title} ${topic.supervisor.firstName} ${topic.supervisor.lastName}`}
                                title={topic.title}
                            />
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}
