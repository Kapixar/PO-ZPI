import { SideBar, type SideBarItem } from "~/components/SideBar";
import type { Route } from "../+types/dashboard";
import { useEffect, useState } from "react";
import { topicService, type Topic } from "~/services/topic.service";


export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Dashboard() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const sideBarData: SideBarItem[] = [
        { icon: "home", name: "Pulpit" },
        { icon: "search", name: "Tematy" },
        { icon: "more_vert", name: "Mój profil" },
        { icon: "more_vert", name: "Oczekujące" },
        { icon: "more_vert", name: "Przyjęte" },
    ]

    useEffect(() => {
        try {
            const topics = topicService.getDemoTopics();
            setTopics(topics)
        } catch (err) {
            setError("error occurred while loading topics")
        } finally {
            setLoading(false)
        }
    }, [])

    if (loading) return <p>Loading...</p>
    if (error) return <p>{error}</p>

    return (
        <div className="">
            <SideBar items={sideBarData} />
            <main className=" rounded-2xl">
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
                <h5>Standardowe</h5>
                <div className="space"></div>
                <h5>Niestandatdowe</h5>
                <div className="space"></div>

            </main>
        </div>
    );
}

