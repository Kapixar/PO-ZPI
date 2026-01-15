import { SideBar } from "~/components/SideBar";
import type { Route } from "./+types/topic.$id";

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

const shapes = [
        "soft-burst",
        "sunny",
        "puffy",
        "diamond",
        "sided-cookie7"
    ]

function TeamMember({ name, role }: TeamMemberProps) {
    
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    return (
        <div>
            <div className={`shape ${randomShape} large-space large`}></div>
            <div>
                <div>
                    {name}
                </div>
                <div>{role}</div>
            </div>
        </div>
    );
}

export default function TopicDetail({ params }: Route.ComponentProps) {
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

                <h3>Opracowanie aplikacji symulującej rozgrywkę giełdową</h3>

                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>

                <h5>Zespół</h5>
                <div className="flex flex-row gap-10"
                >
                    <TeamMember name="Jan Kowalski" role="dr hab" />
                    <TeamMember name="Jan Kowalski" role="263043" />
                    <TeamMember name="Jan Kowalski" role="263043" />
                    <TeamMember name="Jan Kowalski" role="263043" />
                </div>

                <h5>Zarządzanie</h5>

                <h5>Informacje</h5>
                <div style={{ marginTop: "16px" }}>
                    <div
                        style={{
                            paddingTop: "16px",
                            paddingBottom: "16px",
                            borderBottom: "1px solid #e0e0e0",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "0.875rem",
                                color: "#666",
                                marginBottom: "4px",
                            }}
                        >
                            Stan zespołu
                        </div>
                        <div style={{ fontWeight: "400" }}>
                            Otwarty na nowych członków
                        </div>
                    </div>

                    <div
                        style={{
                            paddingTop: "16px",
                            paddingBottom: "16px",
                            borderBottom: "1px solid #e0e0e0",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "0.875rem",
                                color: "#666",
                                marginBottom: "4px",
                            }}
                        >
                            Status tematu
                        </div>
                        <div style={{ fontWeight: "400" }}>
                            Oczekuje na zatwierdzenie KPK
                        </div>
                    </div>

                    <div
                        style={{
                            paddingTop: "16px",
                            paddingBottom: "16px",
                            borderBottom: "1px solid #e0e0e0",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "0.875rem",
                                color: "#666",
                                marginBottom: "4px",
                            }}
                        >
                            Data utworzenia tematu
                        </div>
                        <div style={{ fontWeight: "400" }}>10.06.2025</div>
                    </div>
                </div>
            </main>
        </div>
    );
}
