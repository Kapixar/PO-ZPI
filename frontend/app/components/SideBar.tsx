import { useUser } from "~/contexts/UserContext";
import { UserSwitcherDialog } from "./UserSwitcherDialog";

export type SideBarItem = {
    icon: string;
    name: string;
    href?: string;
};

export function SideBar({ items }: { items?: SideBarItem[] }) {
    const { user } = useUser();

    const data: SideBarItem[] = items ?? [
        { icon: "home", name: "Pulpit", href: "/topics" },
        { icon: "more_vert", name: "Mój profil", href: "/my-profile" },
        { icon: "more_vert", name: "Jeden temat", href: "/topic/5" },
    ];

    return (
        <>
            <nav className="left max surface-container">
                <a>
                    <i>menu</i>
                </a>
                <div className="large-space"></div>
                {data.map((item) => (
                    <a key={item.name} href={item.href ?? "#"}>
                        <i>{item.icon}</i>
                        <div>{item.name}</div>
                    </a>
                ))}
                <div className="small-space"></div>
                <a data-ui="#user-dialog">
                    <i>account_circle</i>
                    <div>{user.role}</div>
                </a>
            </nav>
            <UserSwitcherDialog dialogId={"user-dialog"} />
        </>
    );
}
