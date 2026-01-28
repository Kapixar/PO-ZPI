interface ApproveDialogProps {
    onConfirm: () => void;
    isSubmitting: boolean;
}

export const ApproveDeclarationDialog = ({ onConfirm, isSubmitting }: ApproveDialogProps) => {
    return (
        <dialog
            id="approve-declaration-dialog"
            className="middle-align center-align"
        >
            <div>
                <i className="extra">front_hand</i>
                <h5>Zatwierdzić deklarację ZPI?</h5>
                <p>
                    Zatwierdzenie tej akcji wiąże się ze zgodą na uczestnictwo w
                    projekcie ZPI z przypisaną grupą.
                </p>
                <nav className="right-align no-space">
                    <button
                        className="transparent link"
                        data-ui="#approve-declaration-dialog"
                        disabled={isSubmitting}
                    >
                        Cofnij
                    </button>
                    <button
                        className="transparent link"
                        onClick={onConfirm}
                        data-ui="#approve-declaration-dialog"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <progress className="circle small"></progress>
                        ) : (
                            "Zatwierdź"
                        )}
                    </button>
                </nav>
            </div>
        </dialog>
    );
};