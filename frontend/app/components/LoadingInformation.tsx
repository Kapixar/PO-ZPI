interface LoadingInformationProps {
    message?: string;
}

export function LoadingInformation({
    message = "Ładowanie...",
}: LoadingInformationProps) {
    return (
        <div className="center-align">
            <progress className="circle wavy large"></progress>
            <p>{message}</p>
        </div>
    );
}
