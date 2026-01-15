import { useState } from "react";
import { topicService } from "~/services/topic.service";

interface CreateTopicDialogProps {
    onClose: () => void;
    onCreated: () => void;
}

export function CreateTopicDialog({ onClose, onCreated }: CreateTopicDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    // Defaulting logic: If user wants specific spec, we can adjust. 
    // For now, keeping fields simple.

    const handleSubmit = async () => {
        if (!title || !description) return;

        await topicService.createTopic({
            title,
            description,
            isStandard: true, // Defaulting for simplicity unless specific input needed
            maxMembers: 4
        });
        onCreated();
        onClose();
    };

    return (
        <div className="overlay active">
            <dialog className="active modal small">
                <h5 className="mb-4">Dodaj temat</h5>

                <div className="field border label mb-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} />
                    <label>Temat</label>
                </div>

                <div className="field border label textarea mb-4">
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}></textarea>
                    <label>Opis</label>
                </div>

                <nav className="right-align">
                    <button className="border" onClick={onClose}>Anuluj</button>
                    <button onClick={handleSubmit} className="primary-container on-primary-container">
                        Dodaj temat
                    </button>
                </nav>
            </dialog>
        </div>
    );
}
