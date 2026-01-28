interface NotificationBoxProps {
    message: string;
    isError?: boolean;
    customHeader?: string;
}

export const NotificationBox = ({
    message,
    isError = false,
    customHeader,
}: NotificationBoxProps) => {
    return (
        <article className={`border ${isError ? "error" : "info"}`}>
            <div>
                <i className="extra">{isError ? "error" : "check_circle"}</i>
                <h6>{customHeader ?? (isError ? "Błąd" : "Sukces")}</h6>
                <p>{message}</p>
            </div>
        </article>
    );
};
