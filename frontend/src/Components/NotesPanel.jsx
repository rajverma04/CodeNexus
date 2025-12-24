import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNote } from "../notesSlice";

const NotesPanel = ({ problemId }) => {
    const dispatch = useDispatch();
    const notesByProblem = useSelector((state) => state.notes.byProblem);
    const storedNote = useMemo(() => notesByProblem[problemId] || "", [notesByProblem, problemId]);
    const [draft, setDraft] = useState(storedNote);

    // Keep local draft in sync if the note changes elsewhere (e.g., reload from storage).
    useEffect(() => {
        setDraft(storedNote);
    }, [storedNote, problemId]);

    // Persist notes to localStorage so drafts survive refreshes.
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            localStorage.setItem("cn_notes", JSON.stringify(notesByProblem));
        } catch (err) {
            console.warn("Failed to persist notes", err);
        }
    }, [notesByProblem]);

    const handleChange = (event) => {
        const value = event.target.value;
        setDraft(value);
        dispatch(setNote({ problemId, content: value }));
    };

    return (
        <div className="flex h-full flex-col gap-3 rounded-xl bg-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notes</h3>
                <p className="text-xs text-base-content/60">Saved locally to this browser</p>
            </div>
            <textarea
                value={draft}
                onChange={handleChange}
                placeholder="Jot down approaches, edge cases, or reminders..."
                className="textarea textarea-bordered h-[400px] w-full resize-none bg-base-100 text-sm focus:outline-none"
            />
            <p className="text-right text-xs text-base-content/60">Autosaves instantly</p>
        </div>
    );
};

export default NotesPanel;
