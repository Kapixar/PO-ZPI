import { SideBar } from "~/components/SideBar";
import { TopicCard } from "~/components/TopicCard";
import { CreateTopicDialog } from "~/components/CreateTopicDialog";
import { topicService, type Topic, type Supervisor } from "~/services/topic.service";
import { useEffect, useState } from "react";
import type { Route } from "./+types/my-profile";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Mój profil" },
    ];
}

export default function MyProfile() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const fetchData = async () => {
        const sup = await topicService.getSupervisor();
        setSupervisor(sup);
        const tops = await topicService.getTopics(sup.id);
        setTopics(tops);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="flex h-screen bg-surface overflow-hidden">
            <SideBar />
            <main className="flex-1 p-0 overflow-hidden flex flex-col items-center">
                <div className="w-full max-w-4xl pt-4 px-4 h-full flex flex-col relative overflow-y-auto pb-20">
                    {/* Header */}
                    <header className="mb-8 mt-4">
                        <div className="flex items-center mb-4">
                            <button className="circle transparent">
                                <i>arrow_back</i>
                            </button>
                        </div>
                        <h1 className="text-5xl font-bold mb-2">Mój profil</h1>
                        <div className="text-on-surface-variant text-lg">
                            {supervisor?.title} {supervisor?.firstName} {supervisor?.lastName}
                        </div>
                    </header>

                    {/* Content */}
                    <div className="w-full">
                        {/*
                        {topics.length > 0 ? (
                            topics.map((topic, index) => (
                                <TopicCard key={topic.id} topic={topic} index={index + 1} />
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <h4 className="mb-2">Nie zarządzasz żadnymi tematami</h4>
                            </div>
                        )}
                        */}
                    </div>

                    {/* FAB */}
                    <div className="fixed right-6 bottom-6">
                        <button className="extended FAB surface-container-highest" onClick={() => setShowCreateDialog(true)}>
                            <i>add</i>
                            <span>Dodaj temat</span>
                        </button>
                    </div>
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
