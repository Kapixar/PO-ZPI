import { useUser } from "~/contexts/UserContext";
import { UserSwitcherDialog } from "./UserSwitcherDialog";

export type SideBarItem = {
    icon: string;
    name: string;
    href?: string;
};

export function SideBar({ items }: { items?: SideBarItem[] }) {
    const { user } = useUser();
    const dialogId = "user-switcher-dialog";

    const data: SideBarItem[] = items ?? [
        { icon: "home", name: "Pulpit", href: "/dashboard" },
        { icon: "search", name: "Tematy", href: "/dashboard" },
        { icon: "more_vert", name: "Mój profil", href: "/my-profile" },
    ];

    const openDialog = () => {
        const dialog = document.getElementById(dialogId) as any;
        if (dialog) {
            dialog.showModal();
        }
    };

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
                <a onClick={openDialog} style={{ cursor: "pointer" }}>
                    <i>account_circle</i>
                    <div>{user.role}</div>
                </a>
            </nav>
            <UserSwitcherDialog dialogId={dialogId} />
        </>
    );
}
