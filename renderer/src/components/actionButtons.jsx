export const ActionButtons = ({
  appState,
  onStartWork,
  onStartBreak,
  onEndWork,
  onEndBreak,
}) => {
  const btnSize = "60px";

  return (
    <div className="actionButtons p-4">
      {/* WIDOK PODCZAS JEŚLI NIE ROZPACZETO PRACY */}
      {appState == "IDLE" && (
        <button
          onClick={onStartWork}
          className={`p-4 h-[${btnSize}] bg-emerald-400 hover:bg-emerald-500 rounded-lg w-full cursor-pointer`}
        >
          Zacznij prace
        </button>
      )}
      {/* WIDOK W TRAKCIE PRACY */}
      {appState == "WORKING" && (
        <div className="flex gap-2">
          <button
            onClick={onStartBreak}
            className={`p-4 h-[${btnSize}] bg-orange-400 hover:bg-orange-500 w-full rounded-lg cursor-pointer`}
          >
            Zrób przerwę
          </button>
          <button
            onClick={onEndWork}
            className={`p-4 h-[${btnSize}] w-[${btnSize}] bg-red-400 hover:bg-red-500 rounded-lg cursor-pointer shrink-0`}
          >
            X
          </button>
        </div>
      )}
      {/* WIDOK W TRAKCIE PRZERWY */}
      {appState == "BREAK" && (
        <button
          onClick={onEndBreak}
          className={`p-4 h-[${btnSize}] bg-red-400 hover:bg-red-500 rounded-lg w-full cursor-pointer`}
        >
          Zakończ przerwę
        </button>
      )}
    </div>
  );
};
