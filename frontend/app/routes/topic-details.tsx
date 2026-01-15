import { SideBar } from "~/components/SideBar";
import { topicService, type Topic } from "~/services/topic.service";
import { useLoaderData, Link } from "react-router";
import type { Route } from "./+types/topic-details";
import { useEffect, useState } from "react";

export async function clientLoader({ params }: Route.LoaderArgs) {
    const topic = await topicService.getTopic(params.id);
    if (!topic) throw new Response("Not Found", { status: 404 });
    return topic;
}

export default function TopicDetails() {
    const topic = useLoaderData() as Topic;

    // Placeholder data for team members display
    const teamMembers = [1, 2, 3, 4].map(id => ({
        id,
        name: 'Jan Kowalski',
        idNumber: '263043',
        avatar: `https://ui-avatars.com/api/?name=Jan+Kowalski&background=random&seed=${id}`
    }));

    return (
        <div className="flex h-screen bg-surface">
            <SideBar />
            <main className="flex-1 p-0 overflow-hidden flex flex-col items-center">
                <div className="w-full max-w-4xl pt-4 px-4 h-full flex flex-col relative overflow-y-auto pb-10">
                    <nav className="mb-4">
                        <Link to="/my-profile" className="button circle transparent">
                            <i>arrow_back</i>
                        </Link>
                        <div className="max"></div>
                        <button className="circle transparent"><i>more_vert</i></button>
                    </nav>

                    <h3 className="mb-4 font-bold">{topic.title}</h3>

                    <p className="text-justify mb-8 text-on-surface-variant">
                        {topic.description}
                    </p>

                    <h4 className="mb-4">Zespół</h4>
                    <div className="row scroll mb-8">
                        {teamMembers.map(member => (
                            <div key={member.id} className="flex flex-col items-center gap-2 min-w-[100px]">
                                <img src={member.avatar} className="circle large" alt={member.name} />
                                <div className="text-center">
                                    <div className="font-bold text-sm">{member.name}</div>
                                    <div className="text-xs text-on-surface-variant">{member.idNumber}</div>
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-col items-center gap-2 min-w-[100px]">
                            <button className="circle large surface-variant">
                                <i>settings</i>
                            </button>
                            <div className="font-bold text-sm">Modyfikuj</div>
                        </div>
                    </div>

                    <h4 className="mb-4">Zarządzanie</h4>
                    <div className="row wrap gap-4 mb-8">
                        <button className="chip surface-variant">
                            <i>check_box</i>
                            <span>Zatwierdź deklarację</span>
                        </button>
                        <button className="chip surface-variant">
                            <i>format_size</i>
                            <span>Uzasadnij niestandardowy rozmiar zespołu</span>
                        </button>
                        <button className="chip surface-variant">
                            <i>group</i>
                            <span>Zmień stan</span>
                        </button>
                    </div>

                    <h4 className="mb-4">Informacje</h4>
                    <div className="flex flex-col gap-6">
                        <div>
                            <div className="text-sm text-on-surface-variant mb-1">Stan zespołu</div>
                            <div className="text-lg">{topic.isOpen ? 'Otwarty na nowych członków' : 'Zamknięty'}</div>
                            <hr className="mt-2" />
                        </div>
                        <div>
                            <div className="text-sm text-on-surface-variant mb-1">Status tematu</div>
                            <div className="text-lg">{topic.status === 'OCZEKUJACY' ? 'Oczekuje na zatwierdzenie KPK' : topic.status}</div>
                            <hr className="mt-2" />
                        </div>
                        <div>
                            <div className="text-sm text-on-surface-variant mb-1">Data utworzenia tematu</div>
                            <div className="text-lg">{topic.creationDate}</div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
