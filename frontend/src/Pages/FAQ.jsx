import { HelpCircle } from "lucide-react";

const FAQ = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-4xl px-4 py-6 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-600"><HelpCircle className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-xl font-bold">FAQ & Info</h1>
            <p className="text-xs text-zinc-400">Quick answers. No fluff.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Global Rank</h2>
          <ul className="mt-3 text-sm text-zinc-300 space-y-2 list-disc list-inside">
            <li>Rank is based on distinct problems solved (accepted submissions). Same problem solved multiple times counts once.</li>
            <li>We assign a unique rank: users are ordered by solves (high → low). Ties are broken by a stable internal ID.</li>
            <li>New users with 0 solves are Unranked. Solve one to get a rank.</li>
            <li>Rank updates immediately after your accepted submission.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Public Profile</h2>
          <ul className="mt-3 text-sm text-zinc-300 space-y-2 list-disc list-inside">
            <li>Your public profile is at <span className="font-mono">/profile/&lt;username&gt;</span>.</li>
            <li>It shows: solved count, difficulty breakdown, success rate, global rank, recent submissions.</li>
            <li>Set or change your username in Settings. Older accounts get a default username at login.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Notebook & Notes</h2>
          <ul className="mt-3 text-sm text-zinc-300 space-y-2 list-disc list-inside">
            <li>Notebook shows all your problem notes. Use “Print All” for a PDF.</li>
            <li>Notes save to your account when online, with local fallback.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
