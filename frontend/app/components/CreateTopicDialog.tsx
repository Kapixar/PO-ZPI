import { useState } from "react";
import { topicService } from "~/services/topic.service";

interface CreateTopicDialogProps {
    onClose: () => void;
    onCreated: () => void;
}

export function CreateTopicDialog({ onClose, onCreated }: CreateTopicDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async () => {
        if (!title || !description) return;

        await topicService.createTopic({
            title,
            description,
            isStandard: true,
            maxMembers: 4
        });
        onCreated();
        onClose();
    };

    return (
        <div className="overlay active">
            <dialog className="active modal medium">
                <header>
                    <h5 className="no-margin">Dodaj temat</h5>
                </header>

                <div className="field border label">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
                    <label>Temat</label>
                </div>

                <div className="field border label textarea">
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}></textarea>
                    <label>Opis</label>
                </div>

                <nav className="right-align">
                    <button className="transparent border" onClick={onClose}>Anuluj</button>
                    <button onClick={handleSubmit} className="fill">
                        Dodaj temat
                    </button>
                </nav>
            </dialog>
        </div>
    );
}
