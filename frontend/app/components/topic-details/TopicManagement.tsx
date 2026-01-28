import { UserRole, useUser } from "~/contexts/UserContext";

interface TopicManagementProps {
    isSupervisor: boolean;
    isUserTeamMember: boolean;
    isDeclarationApproved: boolean;
}

export function TopicManagement({
    isSupervisor,
    isUserTeamMember,
    isDeclarationApproved,
}: TopicManagementProps) {
    const { hasRole } = useUser();

    if (!isSupervisor && !isUserTeamMember) {
        return null;
    }

    return (
        <>
            <h5>Zarządzanie</h5>

            <nav className="group">
                {isUserTeamMember && (
                    <button
                        className="fill small-round"
                        disabled={isDeclarationApproved}
                        data-ui="#approve-declaration-dialog"
                    >
                        <i>check_box</i>
                        <span>
                            {isDeclarationApproved
                                ? "Deklaracja zatwierdzona"
                                : "Zatwierdź deklarację"}
                        </span>
                    </button>
                )}
                {hasRole(UserRole.Teacher) && (
                    <>
                        <button className="fill small-round">
                            <i>format_size</i>
                            <span>
                                Uzasadnij niestandardowy rozmiar zespołu
                            </span>
                        </button>
                        <button className="fill small-round">
                            <i>group</i>
                            <span>Zmień stan</span>
                        </button>
                    </>
                )}
            </nav>
        </>
    );
}
