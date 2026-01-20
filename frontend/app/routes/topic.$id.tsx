import { SideBar } from "~/components/SideBar";
import type { Route } from "./+types/topic.$id";
import { UserRole, useUser } from "~/contexts/UserContext";

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

function TeamMember({ name, role }: TeamMemberProps) {
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
                <div className="medium-text">{role}</div>
            </div>
        </div>
    );
}

const ApproveDialog = () => {
    return (
        <dialog
            id="approve-declaration-dialog"
            className="middle-align center-align"
        >
            <div>
                <i className="extra">front_hand</i>
                <h5>Zatwierdzić deklarację ZPI?</h5>
                <p>
                    Zatwierdzenie tej akcji wiąże się ze zgodą na uczestnictwo z
                    projekcie ZPI z przypisaną grupą.
                </p>
                <nav className="right-align no-space">
                    <button className="transparent link">Cofnij</button>
                    <button className="transparent link">Zatwierdź</button>
                </nav>
            </div>
        </dialog>
    );
};

export default function TopicDetail({ params }: Route.ComponentProps) {
    const { hasRole } = useUser();

    const isDeclarationApproved = false;

    return (
        <div className="">
            <SideBar />
            <main className="rounded-2xl large-padding">
                <ApproveDialog />
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
                <div className="flex flex-row gap-10">
                    <TeamMember name="Jan Kowalski" role="dr hab" />
                    <TeamMember name="Jan Kowalski" role="263043" />
                    <TeamMember name="Jan Kowalski" role="263043" />
                    <TeamMember name="Jan Kowalski" role="263043" />
                </div>

                <h5>Zarządzanie</h5>

                <nav className="group">
                    {hasRole(UserRole.Student, UserRole.Prowadzący) && (
                        <button
                            className="fill small-round"
                            disabled={isDeclarationApproved}
                            data-ui="#approve-declaration-dialog"
                        >
                            <i>check_box</i>
                            <span>Zatwierdź deklarację</span>
                        </button>
                    )}
                    <button className="fill small-round">
                        <i>format_size</i>
                        <span>Uzasadnij niestandardowy rozmiar zespołu</span>
                    </button>
                    <button className="fill small-round">
                        <i>group</i>
                        <span>Zmień stan</span>
                    </button>
                </nav>

                <h5>Informacje</h5>
                <ul className="list border">
                    <li>
                        <div className="max">
                            <h6 className="small">Stan zespołu</h6>
                            <div>Oczekuje na nowych członków</div>
                        </div>
                    </li>
                    <li>
                        <div className="max">
                            <h6 className="small">Status tematu</h6>
                            <div>Oczekuje na zatwierdzenie KPK</div>
                        </div>
                    </li>
                    <li>
                        <div className="max">
                            <h6 className="small">Data utworzenia tematu</h6>
                            <div>10.06.2025</div>
                        </div>
                    </li>
                </ul>
            </main>
        </div>
    );
}
