// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion, scale } from "framer-motion";
// COMPONENTS
import { TimeText } from "./timeText";

export const ActionButtons = ({
  appState,
  onStartWork,
  onStartBreak,
  onEndWork,
  onEndBreak,
  timeToBreak,
}) => {
  const btnSize = "60px";

  // Styl dla przycisków o zmiennej szerokości
  const buttonStyle = {
    height: btnSize,
    color: "white",
    fontWeight: 600,
    fontSize: "20px",
  };

  // Styl dla kwadratowego przycisku X
  const squareButtonStyle = {
    height: btnSize,
    width: btnSize,
    color: "white",
    fontWeight: 600,
    fontSize: "20px",
  };

  return (
    // Główny kontener AnimatePresence do animowania całych bloków
    <div className="actionButtons p-4 flex flex-col items-center gap-2">
      {/* TEKST ILE ZOSTAŁO DO PRZERWY */}
      <AnimatePresence>
        {appState === "WORKING" && (
          <motion.p
            className="text-center text-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", transition: { delay: 0.3 } }}
            exit={{ opacity: 0, height: 0 }}
          >
            Zalecana przerwa za{" "}
            <span className="font-semibold">
              <TimeText milliseconds={timeToBreak} letters />
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* === PRZYCISKI === */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* WIDOK, GDY NIE PRACUJEMY (IDLE) */}
          {appState === "IDLE" && (
            <motion.button
              key="start-work"
              onClick={onStartWork}
              style={buttonStyle}
              className="p-4 bg-emerald-400 hover:bg-emerald-500 rounded-lg w-full cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Zacznij pracę
            </motion.button>
          )}

          {/* WIDOK W TRAKCIE PRACY I PRZERWY - WSPÓLNY KONTENER DLA ANIMACJI */}
          {(appState === "WORKING" || appState === "BREAK") && (
            <motion.div
              key="work-break-container"
              className="flex gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Główny przycisk, który się zmienia */}
              <motion.button
                layout // To jest klucz do animacji rozmiaru!
                onClick={appState === "WORKING" ? onStartBreak : onEndBreak}
                style={buttonStyle}
                className={`p-4 rounded-lg w-full cursor-pointer ${
                  appState === "WORKING"
                    ? "bg-orange-400 hover:bg-orange-500"
                    : "bg-red-400 hover:bg-red-500"
                }`}
                transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
              >
                {appState === "WORKING" ? "Zrób przerwę" : "Zakończ przerwę"}
              </motion.button>

              {/* Przycisk 'X', który znika */}
              <AnimatePresence>
                {appState === "WORKING" && (
                  <motion.button
                    key="end-work"
                    onClick={onEndWork}
                    style={squareButtonStyle}
                    className="p-4 bg-red-400 hover:bg-red-500 rounded-lg cursor-pointer shrink-0"
                    exit={{
                      opacity: 0,
                      width: 0,
                      marginLeft: 0, // Usuwamy marginesy podczas animacji
                      padding: 0,
                    }}
                    transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                  >
                    X
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
