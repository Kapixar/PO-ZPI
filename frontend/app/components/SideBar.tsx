export type SideBarItem = {
    icon: string;
    name: string;
    href?: string;
};

export function SideBar({ items }: { items?: SideBarItem[] }) {
    const data: SideBarItem[] = items ?? [
        { icon: "home", name: "Pulpit", href: "/dashboard" },
        { icon: "search", name: "Tematy", href: "/dashboard" },
        { icon: "more_vert", name: "Mój profil", href: "/my-profile" },
    ];

    return (
        <nav className="left max surface-container">
            {data.map((item) => (
                <a key={item.name} href={item.href ?? "#"}>
                    <i>{item.icon}</i>
                    <div>{item.name}</div>
                </a>
            ))}
        </nav>
    );
}
