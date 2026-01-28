import { Link, useLocation } from "react-router";
import { UserRole, useUser } from "~/contexts/UserContext";
import { UserSwitcherDialog } from "./UserSwitcherDialog";

export type SideBarItem = {
    icon: string;
    name: string;
    href?: string;
};

export function SideBar({ items }: { items?: SideBarItem[] }) {
    const { user, hasRole } = useUser();
    const location = useLocation();

    const data: SideBarItem[] = items
        ? items
        : hasRole(UserRole.KPK)
          ? [
                { icon: "home", name: "Pulpit" },
                { icon: "list", name: "Tematy", href: "/topics" },
                { icon: "account_circle", name: "Mój profil" },
                {
                    icon: "hourglass_empty",
                    name: "Oczekujące",
                    href: "/pending",
                },
                { icon: "check_circle", name: "Przyjęte" },
            ]
          : hasRole(UserRole.Coordinator)
            ? [
                  { icon: "home", name: "Pulpit" },
                  { icon: "list", name: "Zespoły", href: "/topics" },
                  { icon: "account_circle", name: "Mój profil" },
              ]
            : hasRole(UserRole.Student)
              ? [
                    { icon: "home", name: "Pulpit" },
                    { icon: "list", name: "Zespoły", href: "/topics" },
                ]
              : [
                    { icon: "home", name: "Pulpit" },
                    { icon: "list", name: "Lista tematów", href: "/topics" },
                    {
                        icon: "account_circle",
                        name: "Mój profil",
                        href: "/my-profile",
                    },
                ];

    return (
        <>
            <nav className="left max surface-container">
                <a>
                    <i>menu</i>
                </a>
                <div className="large-space"></div>
                {data.map((item) => {
                    const isActive = item.href === location.pathname;
                    return (
                        <Link
                            to={item.href ?? "#"}
                            key={item.name}
                            className={`${isActive ? "active" : ""}`}
                            aria-disabled={!item.href}
                        >
                            <i>{item.icon}</i>
                            <div>{item.name}</div>
                        </Link>
                    );
                })}
                <div className="small-space"></div>
                <a data-ui="#user-dialog">
                    <i>account_circle</i>
                    <div>
                        <div>{user.role}</div>
                        <div className="small-text">{user.name}</div>
                    </div>
                </a>
            </nav>
            <UserSwitcherDialog dialogId={"user-dialog"} />
        </>
    );
}
