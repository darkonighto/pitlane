import { AddPlanButton } from "../add-plan";
import { games } from "../games";
import { usePitlane } from "../store";
import { PageHeader, SafetyBadge } from "../ui";

export function Games() {
  const picked = usePitlane((s) => s.games);
  const toggle = usePitlane((s) => s.toggleGame);
  const selected = games.filter((game) => picked.includes(game.id));

  return (
    <div>
      <PageHeader
        kicker="Games"
        title="Settings that belong to the game"
        lede="Most of a frame rate lives in the game menu, not in a startup list. Pick what you play. Each note says what to try and what it will not fix."
      />
      <div className="flex flex-wrap gap-2">
        {games.map((game) => {
          const on = picked.includes(game.id);
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => toggle(game.id)}
              className={
                on
                  ? "min-h-11 rounded-sm bg-accent px-3 text-sm font-medium text-accent-fg"
                  : "min-h-11 rounded-sm border border-border bg-surface px-3 text-sm text-muted"
              }
            >
              {game.title}
            </button>
          );
        })}
      </div>
      {selected.length === 0 ? (
        <p className="mt-6 text-sm leading-relaxed text-muted">Choose at least one game. Nothing is assumed installed.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {selected.map((game) => (
            <li key={game.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs text-subtle">{game.genre}</p>
              <h2 className="mt-1 text-lg font-semibold">{game.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{game.blurb}</p>
              <ul className="mt-4 space-y-4">
                {game.settings.map((setting) => (
                  <li key={setting.id} className="border-t border-border pt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{setting.name}</h3>
                      <SafetyBadge safety={setting.safety} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-fg">{setting.suggestion}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{setting.why}</p>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
                      {setting.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <p className="mt-2 text-xs text-subtle">Undo: {setting.undo.join(" ")}</p>
                    <div className="mt-3">
                      <AddPlanButton
                        draft={{
                          key: `game:${game.id}:${setting.id}`,
                          title: `${game.title}: ${setting.name}`,
                          summary: setting.suggestion,
                          steps: setting.steps,
                          undo: setting.undo,
                          safety: setting.safety,
                          area: "Game",
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
