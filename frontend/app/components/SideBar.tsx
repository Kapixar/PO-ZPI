export type SideBarItem = {
    icon: string;
    name: string;
    href?: string;
};

export function SideBar({ items }: { items?: SideBarItem[] }) {
    const data: SideBarItem[] = items ?? [
        { icon: "home", name: "Pulpit" },
        { icon: "search", name: "Tematy" },
        { icon: "more_vert", name: "Mój profil" },
    ];

    return (
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
        </nav>
    );
}
