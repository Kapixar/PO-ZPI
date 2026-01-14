import { SideBar, type SideBarItem } from "~/components/SideBar";
import type { Route } from "../+types/dashboard";
import { useState } from "react";


export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Dashboard() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const sideBarData: SideBarItem[] = [
        { icon: "home", name: "Pulpit" },
        { icon: "search", name: "Zespoły" },
        { icon: "more_vert", name: "Mój profil" },
    ]

    const onDownloadClick = () => {
        alert("info")
    }

    const onConfirm = () => {
        setIsDialogOpen(false);
    }

    const onCancel = () => {
        setIsDialogOpen(false);
    }

    return (
        <div className="">
            <SideBar items={sideBarData} />
            <main className=" rounded-2xl">
                <nav>
                    <button className="circle transparent">
                        <i>arrow_back</i>
                    </button>
                    <div className="max"></div>
                    <button type="button" className="circle transparent" onClick={onDownloadClick}>
                        <i>download</i>
                    </button>
                    <button className="circle transparent">
                        <i>more_vert</i>
                    </button>
                </nav>
                <h3>Lista zespołów ZPI</h3>
                <nav className="scroll ground">
                    <button className="chip">Sortuj</button>
                    <button className="chip">Otwarty</button>
                    <button className="chip">Min liczba osób</button>
                    <button className="chip">Max liczba osób</button>
                </nav>
                <div className="space"></div>
                <hr />

            </main>
        </div>
    );
}

