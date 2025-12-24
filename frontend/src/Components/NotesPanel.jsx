import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setNote } from "../notesSlice";
import axiosClient from "../utils/axiosClient";

const NotesPanel = ({ problemId }) => {
    const dispatch = useDispatch();
    const notesByProblem = useSelector((state) => state.notes.byProblem);
    const storedNote = useMemo(() => notesByProblem[problemId] || "", [notesByProblem, problemId]);
    const [draft, setDraft] = useState(storedNote);
    const [status, setStatus] = useState("local"); // local | syncing | saved | error

    // Keep local draft in sync if the note changes elsewhere (e.g., reload from storage).
    useEffect(() => {
        setDraft(storedNote);
    }, [storedNote, problemId]);

    // Load server note initially
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const res = await axiosClient.get(`/notes/${problemId}`);
                if (isMounted && res.data?.success) {
                    const content = res.data?.content ?? "";
                    setDraft(content);
                    dispatch(setNote({ problemId, content }));
                    setStatus("saved");
                }
            } catch (err) {
                // Stay with local notes
                setStatus("local");
            }
        })();
        return () => { isMounted = false; };
    }, [problemId, dispatch]);

    // Removed localStorage persistence to avoid cross-account leakage.

    const handleChange = async (event) => {
        const value = event.target.value;
        setDraft(value);
        dispatch(setNote({ problemId, content: value }));
        // Save to server (debounced behavior could be added later)
        try {
            setStatus("syncing");
            await axiosClient.post(`/notes/${problemId}`, { content: value });
            setStatus("saved");
        } catch (err) {
            setStatus("error");
        }
    };

    return (
        <div className="flex h-full flex-col gap-3 rounded-xl bg-base-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notes</h3>
                <p className="text-xs text-base-content/60">
                    {status === "syncing" && "Saving..."}
                    {status === "saved" && "Saved to account"}
                    {status === "error" && "Save failed (kept locally)"}
                    {status === "local" && "Saved locally"}
                </p>
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
