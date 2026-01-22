import { useState } from "react";
import { topicService } from "~/services/topic.service";

interface CreateTopicDialogProps {
    onCreated: () => void;
}

export function CreateTopicDialog({ onCreated }: CreateTopicDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = async () => {
        if (!title || !description) return;

        await topicService.createTopic({
            title,
            description,
            isStandard: true,
            maxMembers: 4,
        });
        onCreated();
        setTitle("");
        setDescription("");
    };

    return (
        <dialog id="create-topic-dialog" className="medium">
            <header>
                <h5 className="no-margin">Dodaj temat</h5>
            </header>

            <div className="field label border round">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <label>Temat</label>
            </div>

            <div className="field border label round">
                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></input>
                <label>Opis</label>
            </div>

            <nav className="right-align">
                <button className="transparent" data-ui="#create-topic-dialog">
                    Anuluj
                </button>
                <button
                    onClick={handleSubmit}
                    data-ui="#create-topic-dialog"
                    className="transparent link"
                    disabled={!title.trim() || !description.trim()}
                >
                    Dodaj temat
                </button>
            </nav>
        </dialog>
    );
}
