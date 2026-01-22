import { useUser, mockUsers, type User } from "~/contexts/UserContext";

interface UserSwitcherDialogProps {
    dialogId: string;
}

export function UserSwitcherDialog({ dialogId }: UserSwitcherDialogProps) {
    const { user, setUser } = useUser();

    const handleUserChange = (selectedUser: User) => {
        setUser(selectedUser);
    };

    return (
        <dialog id={dialogId}>
            <h5>Zmień użytkownika</h5>
            <p>Wybierz użytkownika, aby przetestować różne uprawnienia</p>
            <nav className="group">
                {mockUsers.map((mockUser) => (
                    <button
                        key={mockUser.role + (mockUser.user_id ?? "")}
                        onClick={() => handleUserChange(mockUser)}
                        className={`chip medium ${
                            user.role === mockUser.role && user.user_id === mockUser.user_id ? "fill" : ""
                        }`}
                    >
                        {user.role === mockUser.role && user.user_id === mockUser.user_id ? <i>done</i> : ""}

                        <span>{mockUser.role}</span>
                        <span>{mockUser.name}</span>
                    </button>
                ))}
            </nav>
            <nav>
                <button className="transparent link" data-ui={`#${dialogId}`}>
                    Cofnij
                </button>
            </nav>
        </dialog>
    );
}
