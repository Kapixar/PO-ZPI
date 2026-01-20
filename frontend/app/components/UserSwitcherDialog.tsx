import { useUser, mockUsers, type User } from "~/contexts/UserContext";

interface UserSwitcherDialogProps {
    dialogId: string;
}

export function UserSwitcherDialog({ dialogId }: UserSwitcherDialogProps) {
    const { user, setUser } = useUser();

    const handleUserChange = (selectedUser: User) => {
        setUser(selectedUser);
        // Close dialog using beercss method
        const dialog = document.getElementById(dialogId) as any;
        if (dialog) {
            dialog.close();
        }
    };

    return (
        <div>
            <div className="overlay blur"></div>
            <dialog id={dialogId}>
                <h5>Zmień użytkownika</h5>
                <p>Wybierz użytkownika, aby przetestować różne uprawnienia</p>
                <div>
                    {mockUsers.map((mockUser) => (
                        <button
                            key={mockUser.role}
                            onClick={() => handleUserChange(mockUser)}
                            className={`chip ${
                                user.role === mockUser.role
                                    ? "fill"
                                    : "surface-variant"
                            }`}
                        >
                            <i>
                                {user.role === mockUser.role
                                    ? "check_circle"
                                    : "person"}
                            </i>
                            <span>{mockUser.role}</span>
                        </button>
                    ))}
                </div>
                <nav>
                    <button
                        className="transparent link"
                        onClick={() => {
                            const dialog = document.getElementById(
                                dialogId,
                            ) as any;
                            if (dialog) dialog.close();
                        }}
                    >
                        Zamknij
                    </button>
                </nav>
            </dialog>
        </div>
    );
}
