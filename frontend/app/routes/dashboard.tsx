import { SideBar } from "~/components/SideBar";
import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function Dashboard() {
    return (
        <div className="">
            <SideBar />
            <main className=" rounded-2xl">
                <nav>
                    <button className="circle transparent">
                        <i>arrow_back</i>
                    </button>
                    <div className="max"></div>
                    <button className="circle transparent">
                        <i>download</i>
                    </button>
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
                <hr />
            </main>
        </div>
    );
}

