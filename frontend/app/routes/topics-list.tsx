import { SideBar } from "~/components/SideBar";
import { ProjectListItem } from "~/components/ProjectListItem";
import type { Route } from "../+types/root";
import { UserRole, useUser } from "~/contexts/UserContext";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Dashboard() {
    const { hasRole } = useUser();

    return (
        <div className="">
            <SideBar />
            <main className="rounded-2xl large-padding">
                <nav>
                    <button className="circle transparent">
                        <i>arrow_back</i>
                    </button>
                    <div className="max"></div>
                    {hasRole(UserRole.Koordynator) && (
                        <button className="circle transparent">
                            <i>download</i>
                        </button>
                    )}
                    <button className="circle transparent">
                        <i>more_vert</i>
                    </button>
                </nav>
                <h3>Lista tematów ZPI</h3>
                <nav className="scroll ground">
                    <button className="chip">Sortuj</button>
                    <button className="chip">Otwarty</button>
                    <button className="chip">Min liczba osób</button>
                    <button className="chip">Max liczba osób</button>
                </nav>
                <div className="space"></div>

                <ul className="list border medium-space">
                    <ProjectListItem
                        slots={4}
                        supervisor="dr hab. inż. Michał Szpak"
                        title="Watchout - system rejestracji zdarzeń zagrażających bezpieczeństwu w przestrzeni publicznej"
                    />
                    <ProjectListItem
                        slots={4}
                        supervisor="dr hab. inż. Michał Kowlaski"
                        title="VocalizeR"
                    />
                    <ProjectListItem
                        slots={5}
                        supervisor="dr hab. inż. Michał Kowlaski"
                        title="Rozproszony system zarządzania personelem średnich przedsiębiorstw"
                    />
                    <ProjectListItem
                        slots={3}
                        supervisor="dr hab. inż. Michał Krzak"
                        title="System wspomagania treningu wspinaczkowego"
                    />
                    <ProjectListItem
                        slots={3}
                        supervisor="dr hab. inż. Michał Kwiat"
                        title="AI Present Finder - agent rekomendujący prezenty na podstawie wiedzy o odbiorcy"
                    />
                    <ProjectListItem
                        slots={3}
                        supervisor="dr hab. inż. Michał Przewoźniczek"
                        title="System wspomagania treningu wspinaczkowego"
                    />
                </ul>
            </main>
        </div>
    );
}
