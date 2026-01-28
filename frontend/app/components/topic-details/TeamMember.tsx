interface TeamMemberProps {
    name: string;
    index: string;
    isStudent?: boolean;
    showDeclarationLack?: boolean;
}

export function TeamMember({ name, index, isStudent, showDeclarationLack }: TeamMemberProps) {
    const icon = isStudent ? "school" : "face";
    return (
        <div className="center-align">
            <i
                style={{ "--_size": "7rem" } as React.CSSProperties}
                className="fill"
            >
                {icon}
            </i>
            {showDeclarationLack && <span className="badge no-round border">nie złożono deklaracji</span>}
            <div className="center-align">
                <h6 className="small bold">{name}</h6>
                <div className="medium-text">{index}</div>
            </div>
        </div>
    );
}