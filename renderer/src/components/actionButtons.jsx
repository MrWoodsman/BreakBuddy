// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion, scale } from "framer-motion";
// COMPONENTS
import { TimeText } from "./timeText";
// CONTEXT's
import { useSettings } from "../contexts/SettingsContext";
import { useEffect, useState } from "react";

// Funkcja pomocnicza
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const ActionButtons = ({
  appState,
  onStartWork,
  onStartBreak,
  onEndWork,
  onEndBreak,
  timeToBreak,
  onExerciseDone
}) => {
  const [recommendedExercise, setRecommendedExercise] = useState(null);
  const [exerciseCompleted, setExerciseCompleted] = useState(false); // <-- NOWY STAN
  const { exercises, recommendExercises } = useSettings();

  const btnSize = "60px";

  // Ten useEffect "obserwuje" zmianę stanu aplikacji
  useEffect(() => {
    if (appState === "BREAK" && exercises && exercises.length > 0) {

      // Losowanie ćwiczenia z listy
      const randomIndex = Math.floor(Math.random() * exercises.length);
      const baseExercise = exercises[randomIndex]; // np. { name: "Pompki", reps_min: 5, reps_max: 15 }

      // Losowanie lcczy powtórzen z zakresu
      const specificReps = getRandomInt(baseExercise.reps_min, baseExercise.reps_max);

      // Zapisanie w zmienej ćwiczenie oraz powtórzenia
      setRecommendedExercise({
        name: baseExercise.name,
        reps: specificReps
      });

      setExerciseCompleted(false); // Resetowanie stanu wykonania
    }

    // Kiedy przerwa się kończy (lub zaczyna praca), czyścimy dane
    else if (appState !== "BREAK") {
      setRecommendedExercise(null);
      setExerciseCompleted(false);
    }
  }, [appState, exercises, recommendExercises]);

  // Funkcja do wywołania po kliknięciu "Gotowe"
  const handleExerciseClick = () => {
    if (!recommendedExercise || exerciseCompleted) return;

    onExerciseDone(recommendedExercise); // Wysyłamy dane ćwiczenia do App.jsx
    // console.log('Zapisanie w bazie');
    setExerciseCompleted(true);
  }


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
            {timeToBreak > 0 ? (
              <>
                Zalecana przerwa za{" "}
                <span className="font-semibold">
                  <TimeText milliseconds={timeToBreak} letters />
                </span>
              </>
            ) : (
              <>
                <span className="font-semibold text-orange-500">
                  Zalecana jest teraz przerwa!
                </span>
              </>
            )}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Zalecane Ćwiczenie */}
      <AnimatePresence>
        {appState === "BREAK" && recommendExercises && recommendedExercise && (
          <motion.p
            className="text-center text-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", transition: { delay: 0.3 } }}
            exit={{ opacity: 0, height: 0 }}
          >
            {exerciseCompleted ? "Ukończono" : "Wykonaj"}{" "}
            <span className="font-semibold">
              {recommendedExercise.name} x {recommendedExercise.reps}
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
              className="flex gap-2 overflow-clip w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              layout
            >
              {/* Główny przycisk */}
              <motion.button
                layout
                onClick={appState === "WORKING" ? onStartBreak : onEndBreak}
                style={buttonStyle}
                className={`p-4 rounded-lg w-full cursor-pointer ${appState === "WORKING"
                  ? "bg-orange-400 hover:bg-orange-500"
                  : "bg-red-400 hover:bg-red-500"
                  }`}
                transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
              >
                {appState === "WORKING" ? "Zrób przerwę" : "Zakończ przerwę"}
              </motion.button>

              {/* Przycisk 'X' lub 'Ptaszek' */}
              <AnimatePresence mode="popLayout">
                {appState === "WORKING" && (
                  <motion.button
                    key="end-work-dynamic"
                    onClick={onEndWork}
                    style={squareButtonStyle}
                    className="p-4 bg-red-400 hover:bg-red-500 rounded-lg cursor-pointer shrink-0"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    layout
                    transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                  >
                    <i className="bi bi-x-lg text-2xl leading-none"></i>
                  </motion.button>
                )}

                {appState === "BREAK" && recommendedExercise && recommendExercises && (
                  <motion.button
                    key="exercise-done-dynamic"
                    onClick={handleExerciseClick}
                    disabled={exerciseCompleted || !recommendExercises}
                    style={squareButtonStyle}
                    className={`p-4 rounded-lg cursor-pointer shrink-0 ${exerciseCompleted || !recommendExercises
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-400 hover:bg-blue-500"
                      }`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    layout
                    transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                  >
                    <i className="bi bi-clipboard2-check-fill text-2xl leading-none"></i>
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
