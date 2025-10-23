import { useEffect, useRef, useState } from "react";
import { ActionButtons } from "./components/actionButtons";
import { Informations } from "./components/informations";
import { Timer } from "./components/timers";
// UTILS
import { findDate } from "./utils/findDate";
import { endLastInterval } from "./utils/dataUpdaters";

function App() {
  // ZMIENNE REACT
  const [appState, setAppState] = useState("IDLE");
  const [daysData, setDaysData] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [SessionTime, setSessionTime] = useState(0);
  const [timeToBreakMs, setTimeToBreakMs] = useState(0);
  // REFs
  const appStateRef = useRef(appState);
  const todayDataRef = useRef(todayData);
  const daysDataRef = useRef(daysData);
  const handleDayRolloverRef = useRef(null);
  const startWorkRef = useRef(null);

  // Synchronizacja refow po kazdej zmainie
  useEffect(() => {
    appStateRef.current = appState;
    todayDataRef.current = todayData;
    daysDataRef.current = daysData;
    handleDayRolloverRef.current = handleDayRollover;
    startWorkRef.current = startWork;
  });

  // ODPALENIE APLIKACJI POBRANIE PODSTAWOWYCH DANYCH
  useEffect(() => {
    setAppState("IDLE");

    const loadSavedData = async () => {
      // Klucz pod którym zapisane sa dane
      const key = "daysData";
      // Wywołujemy funckje prelaod.js która jest dostępna globalnie
      const value = await window.electronAPI.getStoreValue(key);
      const currentDaysData = value || [];
      setDaysData(currentDaysData);

      let today = new Date();
      let foundTodayData = findDate({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
        data: currentDaysData,
      });

      if (foundTodayData) {
        setTodayData(foundTodayData);
        setTotalSessionTime(foundTodayData.allBreakTime + foundTodayData.allWorkTime);
        setSessionTime(0); // Sesja na starcie jest zawsze 0
      } else {
        const newTodayObject = {
          year: today.getFullYear(),
          month: today.getMonth() + 1,
          day: today.getDate(),
          allWorkTime: 0,
          allBreakTime: 0,
          workData: [],
          breakData: [],
          exercisesData: [],
        };
        const newDaysData = [...currentDaysData, newTodayObject];

        setTodayData(newTodayObject);
        setDaysData(newDaysData);
        // Zapisujemy od razu
        await window.electronAPI.setStoreValue(key, newDaysData);
      }
    };

    loadSavedData();
  }, []);

  // AUTOMARTTYCZNE ZAPISYWANIE
  useEffect(() => {
    if (!todayData) {
      return;
    }

    if (daysData.length === 0) {
      return;
    }

    const dayInDaysData = daysData.find(
      (d) => d.year === todayData.year && d.month === todayData.month && d.day === todayData.day
    );

    if (!dayInDaysData || dayInDaysData === todayData) {
      return;
    }

    const newDaysData = daysData.map((day) => {
      // Podmień stary obiekt dnia na nową wersję z 'todayData'
      if (
        day.year === todayData.year &&
        day.month === todayData.month &&
        day.day === todayData.day
      ) {
        return todayData;
      }
      // Resztę dni zostaw bez zmian
      return day;
    });

    setDaysData(newDaysData);
    window.electronAPI.setStoreValue("daysData", newDaysData);
  }, [todayData, daysData]);

  // LOGI DLA DEV
  useEffect(() => {
    console.log("days", daysData);
    console.log(todayData);
  }, [daysData, todayData]);

  // Aktualizowanie timerów
  useEffect(() => {
    const updateAllTimers = () => {
      const currentAppState = appStateRef.current;
      const currentTodayData = todayDataRef.current;

      const WORK_DURATION_BEFORE_BREAK = 45 * 60 * 1000;

      if (!currentTodayData) {
        setTotalSessionTime(0);
        setSessionTime(0);
        setTimeToBreakMs(0);
        return;
      }

      // Sprawdź, czy stan aplikacji jest jednym z tych, które nas interesują.
      const activeStates = ["IDLE", "WORKING", "BREAK"];
      if (!activeStates.includes(currentAppState)) {
        setTotalSessionTime(currentTodayData.allBreakTime + currentTodayData.allWorkTime);
        setSessionTime(0);
        return;
      }
      // Aktualizowanie sumy czasu pracy
      // Zmienna tu zeby za kazdym razem zaczynała od 0 / bądz czasu który już jest
      let totalSessionTimeClear = currentTodayData.allBreakTime + currentTodayData.allWorkTime;
      const nowTimestamp = Date.now();

      let activeWorkInterval = currentTodayData.workData[currentTodayData.workData.length - 1];
      let activeBreakInterval = currentTodayData.breakData[currentTodayData.breakData.length - 1];

      if (currentAppState == "WORKING") {
        totalSessionTimeClear += nowTimestamp - activeWorkInterval.startTime;
      }
      if (currentAppState == "BREAK") {
        totalSessionTimeClear += nowTimestamp - activeBreakInterval.startTime;
      }
      setTotalSessionTime(totalSessionTimeClear);

      // Aktualizowanie czasu sesji
      let SessionTimeClear = 0;

      if (currentAppState == "WORKING") {
        SessionTimeClear = nowTimestamp - activeWorkInterval.startTime;
      }
      if (currentAppState == "BREAK") {
        SessionTimeClear = nowTimestamp - activeBreakInterval.startTime;
      }

      // LICZENIE CZASU DO PRZERWY
      if (
        currentAppState === "WORKING" &&
        activeWorkInterval &&
        activeWorkInterval.endTime === null
      ) {
        const breakTargetTime = activeWorkInterval.startTime + WORK_DURATION_BEFORE_BREAK;
        const remainingTime = breakTargetTime - nowTimestamp; // Używamy 'nowTimestamp'

        // Ustawiamy stan w milisekundach
        setTimeToBreakMs(remainingTime > 0 ? remainingTime : 0);
      } else {
        // Jeśli nie pracujemy, lub nie ma aktywnego interwału pracy
        setTimeToBreakMs(0);
      }

      // Sprawdzanie czy przypadkiem nie jest nowy dzien np jakby ktoś sidział do 00:00
      let today = new Date(nowTimestamp); // Zachowaj oryginał, żeby o nim nie zapomnieć
      // // DEV - TESTOWANIE ZMIANY DATY
      // today.setDate(today.getDate() + 1); // "Przesuń" datę o jeden dzień do przodu
      // today.setHours(0, 0, 1, 0); // Ustaw godzinę na 00:00:01
      if (
        currentTodayData.day != today.getDate() ||
        currentTodayData.month != today.getMonth() + 1 ||
        currentTodayData.year != today.getFullYear()
      ) {
        let keysToProcess = null;
        if (currentAppState === "WORKING") {
          keysToProcess = { arrayKey: "workData", totalTimeKey: "allWorkTime" };
        } else if (currentAppState === "BREAK") {
          keysToProcess = { arrayKey: "breakData", totalTimeKey: "allBreakTime" };
        }
        handleDayRolloverRef.current(keysToProcess);
      }

      setSessionTime(SessionTimeClear);
    };

    updateAllTimers(); // Pierwsze wywołanie zeby nie było laga 1s
    const timerId = setInterval(updateAllTimers, 1000); // Aktualizacja co 1s

    // Czyszczenie funkcji
    return () => {
      clearInterval(timerId);
    };
  }, []);

  function handleDayRollover(activeKeys) {
    console.log("Wykryto przejście północy. Rozpoczynam procedurę zmiany dnia...");

    const currentTodayData = todayData;
    const currentDaysData = daysData;
    let finalOldTodayData = { ...currentTodayData };

    // KONCZENIE STAREGO DNIA JESLI BYŁ AKTYWNY
    if (activeKeys) {
      const { arrayKey, totalTimeKey } = activeKeys;
      const oldDayDate = new Date(
        currentTodayData.year,
        currentTodayData.month - 1,
        currentTodayData.day,
        23,
        59,
        59,
        999
      );
      const endTime = oldDayDate.getTime();

      const targetArray = currentTodayData[arrayKey];
      const lastInterval = targetArray[targetArray.length - 1];

      // Sprawdzanie czy jest co zamknąć
      if (lastInterval && lastInterval.endTime === null) {
        const duration = endTime - lastInterval.startTime;
        const updatedArray = targetArray.map((interval, index) =>
          index === targetArray.length - 1 ? { ...interval, endTime, duration } : interval
        );
        finalOldTodayData = {
          ...currentTodayData,
          [arrayKey]: updatedArray,
          [totalTimeKey]: currentTodayData[totalTimeKey] + duration,
        };
      }
    }

    // Zapisanie sfianlziowanego stargego dnia
    const updatedDaysData = currentDaysData.map((day) =>
      day.year === finalOldTodayData.year &&
      day.month === finalOldTodayData.month &&
      day.day === finalOldTodayData.day
        ? finalOldTodayData
        : day
    );
    setDaysData(updatedDaysData);

    // Tworzenie nowego dnia
    const today = new Date();
    const newTodayData = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
      allWorkTime: 0,
      allBreakTime: 0,
      workData: [],
      breakData: [],
      exercisesData: [],
    };

    // Towrzenie nowego interwału w nowym dniu (o 00:00:00) ---
    if (activeKeys) {
      // --- OTO TWOJA LOGIKA (CZ. 2) ---
      const newDayDate = new Date();
      newDayDate.setHours(0, 0, 0, 0); // Ustaw na 00:00:00.000
      const startTime = newDayDate.getTime();
      // --- KONIEC TWOJEJ LOGIKI ---

      newTodayData[activeKeys.arrayKey].push({
        startTime: startTime,
        endTime: null,
        duration: null,
      });
    }

    setTodayData(newTodayData);
  }
  handleDayRolloverRef.current = handleDayRollover;

  // Rozpoczynanie pracy
  const startWork = () => {
    // Sprawdzenie czy przypadkiem już nie jest w czasie pracy
    if (appStateRef.current == "WORKING") return;
    // Ustaianie statusu pracy
    setAppState("WORKING");

    // Tworzenie nowego interwału czasu pracy
    const newWorkInterval = {
      startTime: Date.now(),
      endTime: null,
      duration: null,
    };
    // Dodawanie nowego interwału do dnia
    setTodayData((prevTodayData) => {
      // Tworzenie nowej tablicy workData
      const newWorkData = [...prevTodayData.workData, newWorkInterval];
      // Zwracanie nowego obiektu toodayData
      return {
        ...prevTodayData,
        workData: newWorkData,
      };
    });
  };

  // Rozpoczynanie przerwy
  const startBreak = () => {
    // 1. Sprawdzenie (bez zmian, ale czytelniej)
    if (appStateRef.current !== "WORKING") return;

    // 2. Ustawiamy stan aplikacji (to jest bezpieczne)
    setAppState("BREAK");

    // 3. Obliczamy JEDEN moment w czasie
    const breakStartTime = Date.now(); // Użyjemy tego samego czasu dla obu akcji

    // 4. Tworzymy nowy interwał przerwy
    const newBreakInterval = {
      startTime: breakStartTime, // Przerwa zaczyna się DOKŁADNIE, gdy praca się kończy
      endTime: null,
      duration: null,
    };

    // 5. Wykonujemy JEDNĄ, dużą aktualizację stanu
    setTodayData((prevTodayData) => {
      // Strażnik na wypadek, gdyby dane były null
      if (!prevTodayData) return prevTodayData;

      // === Logika z pierwszej aktualizacji (zakończenie pracy) ===
      const lastWorkInterval = prevTodayData.workData[prevTodayData.workData.length - 1];
      const workDuration = breakStartTime - lastWorkInterval.startTime;

      const updatedWorkData = prevTodayData.workData.map((interval, index) => {
        if (index === prevTodayData.workData.length - 1) {
          return {
            ...interval,
            endTime: breakStartTime, // Używamy naszego jednego czasu
            duration: workDuration,
          };
        }
        return interval;
      });

      // === Logika z drugiej aktualizacji (rozpoczęcie przerwy) ===
      const newBreakData = [...prevTodayData.breakData, newBreakInterval];

      // === Zwracamy JEDEN, kompletny, nowy obiekt stanu ===
      return {
        ...prevTodayData,
        workData: updatedWorkData, // Zawiera zakończoną pracę
        allWorkTime: prevTodayData.allWorkTime + workDuration, // Zawiera zaktualizowany czas
        breakData: newBreakData, // Zawiera rozpoczętą przerwę
      };
    });
  };

  // Konczenie pracy
  const endWork = () => {
    // Sprawdzenie czy przypadkiem już nie jest w czasie pracy
    if (appState != "WORKING") return;
    // Ustaianie statusu pracy
    setAppState("IDLE");

    // Aktualizowanie danych dnia
    endLastInterval({
      setTodayData: setTodayData,
      arrayKey: "workData",
      totalTimeKey: "allWorkTime",
    });
  };

  // Konczenie przerwy
  const endBreak = () => {
    // Sprawdzenie czy przypadkiem już nie jest w czasie pracy
    if (appStateRef.current != "BREAK") return;
    // Ustaianie statusu pracy
    setAppState("WORKING");

    // Aktualizowanie danych dnia
    endLastInterval({
      setTodayData: setTodayData,
      arrayKey: "breakData",
      totalTimeKey: "allBreakTime",
    });

    // Rozpoczynanie spowrotem pracy
    startWork();
  };

  // MACOS PRZYCISKI
  useEffect(() => {
    const cleanup = window.electronAPI.onMenuAction((action) => {
      console.log('Uruchomiono action', action, appStateRef.current);
      switch (action) {
        case "START-WORK":
          startWork()
          break
        case "START-BREAK":
          startBreak()
          break
        case "END-WORK":
          endWork()
          break
        case "END-BREAK":
          endBreak()
          break
        default:
          console.warn('Nieznana akcja z menu: ', action)
      }
    })

    return cleanup
  }, [])

  useEffect(() => {
    console.log(`React: Stan się zmienił na ${appState}. Wysyłam do main.js...`);
    window.electronAPI.updateMenuState(appState);
  }, [appState])

  return (
    <div className="flex flex-col h-full">
      <button className="absolute right-2 top-2 bg-neutral-200 w-8 h-8 cursor-pointer rounded-2xl">
        <i className="bi bi-gear-wide-connected text-neutral-500"></i>
      </button>
      {/* DEV */}
      {/* <p>{appState}</p> */}
      {/* TIMERS */}
      <Timer totalTime={totalSessionTime} sessionTime={SessionTime} />
      {/* INFORMATIONS */}
      <Informations />
      {/* ACTIONS BUTTONS */}
      <ActionButtons
        appState={appState}
        onStartWork={startWork}
        onStartBreak={startBreak}
        onEndWork={endWork}
        onEndBreak={endBreak}
        timeToBreak={timeToBreakMs}
      />
    </div>
  );
}

export default App;
