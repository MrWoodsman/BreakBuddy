import { useEffect, useState } from "react";
import { ActionButtons } from "./components/actionButtons";
import { Informations } from "./components/informations";
import { Timer } from "./components/timers";
// UTILS
import { findDate } from "./utils/findDate";

function App() {
  // ZMIENNE REACT
  const [appState, setAppState] = useState("IDLE");
  const [daysData, setDaysData] = useState([]);
  const [todayData, setTodayData] = useState(null);
  const [totalSessionTime, setTotalSessionTime] = useState(0);
  const [SessionTime, setSessionTime] = useState(0);

  // ODPALENIE APLIKACJI POBRANIE PODSTAWOWYCH DANYCH
  useEffect(() => {
    setAppState("IDLE");

    const loadSavedData = async () => {
      // Klucz pod którym zapisane sa dane
      const key = "daysData";
      // Wywołujemy funckje prelaod.js która jest dostępna globalnie
      const value = await window.electronAPI.getStoreValue(key);

      // Ustawienie danych jeśli, udało się pobrać
      if (value) {
        setDaysData(value);
        // ZNAJDYWANIE CZY JEST DZISIEJSZY DZIEN W BAZIE
        let today = new Date();
        let todayData = findDate({
          year: today.getFullYear(),
          month: today.getMonth(),
          day: today.getDate(),
          data: value,
        });
        // Ustaiwanie jeśli jest
        if (todayData) setTodayData(todayData);
        // Jeśli nie ma tworzymy z dzisiejsza data
        if (!todayData) {
          setTodayData({
            year: today.getFullYear(),
            month: today.getMonth(),
            day: today.getDate(),
            allWorkTime: 0,
            allBreakTime: 0,
            workData: [],
            breakData: [],
            exercisesData: [],
          });
        }
      }
    };

    loadSavedData();
  }, []);

  useEffect(() => {
    console.log(daysData);
    console.log(todayData);
  }, [daysData, todayData]);

  // Aktualizowanie timerów
  useEffect(() => {
    // Sprawdź, czy stan aplikacji jest jednym z tych, które nas interesują.
    const activeStates = ["IDLE", "WORKING", "BREAK"];
    if (!activeStates.includes(appState)) {
      return; // Przerwij, jeśli stan nie jest jednym z aktywnych
    }

    if (!todayData) return;

    const updateAllTimers = () => {
      // Aktualizowanie sumy czasu pracy
      // Zmienna tu zeby za kazdym razem zaczynała od 0 / bądz czasu który już jest
      let totalSessionTimeClear =
        todayData.allBreakTime + todayData.allWorkTime;

      // Dane aktualnych wymairów czasu
      let activeWorkInterval =
        todayData.workData[todayData.workData.length - 1];
      let activeBreakInterval =
        todayData.breakData[todayData.breakData.length - 1];

      if (appState == "WORKING") {
        totalSessionTimeClear += Date.now() - activeWorkInterval.startTime;
      }
      if (appState == "BREAK") {
        totalSessionTimeClear += Date.now() - activeBreakInterval.startTime;
      }
      setTotalSessionTime(totalSessionTimeClear);

      // Aktualizowanie czasu sesji
      let SessionTimeClear = 0;

      if (appState == "WORKING") {
        SessionTimeClear = Date.now() - activeWorkInterval.startTime;
      }
      if (appState == "BREAK") {
        SessionTimeClear = Date.now() - activeBreakInterval.startTime;
      }
      setSessionTime(SessionTimeClear);
    };

    updateAllTimers(); // Pierwsze wywołanie zeby nie było laga 1s
    const timerId = setInterval(updateAllTimers, 1000); // Aktualizacja co 1s

    // Czyszczenie funkcji
    return () => {
      clearInterval(timerId);
    };
  }, [appState, todayData]);

  // Rozpoczynanie pracy
  const startWork = () => {
    // Sprawdzenie czy przypadkiem już nie jest w czasie pracy
    if (appState == "WORKING") return;
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
    // Sprawdzenie czy przypadkiem już nie jest w czasie przerwy
    if (appState == "BREAK" || appState != "WORKING") return;
    // Kończenie aktualnego czasu pracy

    // TEST
    // Obliczanie nowych wartości
    const endTime = Date.now();
    const lastInterval = todayData.workData[todayData.workData.length - 1];
    const duration = endTime - lastInterval.startTime;

    // Aktualizowanie danych dnia
    setTodayData((prevTodayData) => {
      // Za pomoca .map() tworzymy nowa tablice workData
      const updatedWorkData = prevTodayData.workData.map((interval, index) => {
        // jeśli to ostatni element w tablicy
        if (index === prevTodayData.workData.length - 1) {
          // zwracanie nowa zaktualizowana kopie
          return {
            ...interval,
            endTime: endTime,
            duration: duration,
          };
        }
        // W przeciwnym razie zwróc bez zmian
        return interval;
      });

      // Zwracamy kompletnie nowy obiekt, który zastapi start stan todayData
      return {
        ...prevTodayData, // Skopiuj wszystkie właściwości (year,month,day,etc.)
        workData: updatedWorkData, // Nadpiszd `workData` nowa zaktualzowana tablica
        allWorkTime: prevTodayData.allWorkTime + duration, // Zaktaulizuj łaczny czas pracy
      };
    });
    // TEST

    // Ustaianie statusu przerwy
    setAppState("BREAK");

    // Tworzenie nowego interwału czasu przerwy
    const newBreakInterval = {
      startTime: Date.now(),
      endTime: null,
      duration: null,
    };
    // Dodawanie nowego interwału do dnia
    setTodayData((prevTodayData) => {
      // Tworzenie nowej tablicy workData
      const newBreakData = [...prevTodayData.breakData, newBreakInterval];
      // Zwracanie nowego obiektu toodayData
      return {
        ...prevTodayData,
        breakData: newBreakData,
      };
    });
  };

  // Konczenie pracy
  const endWork = () => {
    // Sprawdzenie czy przypadkiem już nie jest w czasie pracy
    if (appState != "WORKING") return;
    // Ustaianie statusu pracy
    setAppState("IDLE");

    // Obliczanie nowych wartości
    const endTime = Date.now();
    const lastInterval = todayData.workData[todayData.workData.length - 1];
    const duration = endTime - lastInterval.startTime;

    // Aktualizowanie danych dnia
    setTodayData((prevTodayData) => {
      // Za pomoca .map() tworzymy nowa tablice workData
      const updatedWorkData = prevTodayData.workData.map((interval, index) => {
        // jeśli to ostatni element w tablicy
        if (index === prevTodayData.workData.length - 1) {
          // zwracanie nowa zaktualizowana kopie
          return {
            ...interval,
            endTime: endTime,
            duration: duration,
          };
        }
        // W przeciwnym razie zwróc bez zmian
        return interval;
      });

      // Zwracamy kompletnie nowy obiekt, który zastapi start stan todayData
      return {
        ...prevTodayData, // Skopiuj wszystkie właściwości (year,month,day,etc.)
        workData: updatedWorkData, // Nadpiszd `workData` nowa zaktualzowana tablica
        allWorkTime: prevTodayData.allWorkTime + duration, // Zaktaulizuj łaczny czas pracy
      };
    });
  };

  // Konczenie przerwy
  const endBreak = () => {
    // Sprawdzenie czy przypadkiem już nie jest w czasie pracy
    if (appState != "BREAK") return;
    // Ustaianie statusu pracy
    setAppState("WORKING");

    // Obliczanie nowych wartości
    const endTime = Date.now();
    const lastInterval = todayData.breakData[todayData.breakData.length - 1];
    const duration = endTime - lastInterval.startTime;

    // Aktualizowanie danych dnia
    setTodayData((prevTodayData) => {
      // Za pomoca .map() tworzymy nowa tablice breakData
      const updatedBreakData = prevTodayData.breakData.map(
        (interval, index) => {
          // jeśli to ostatni element w tablicy
          if (index === prevTodayData.breakData.length - 1) {
            // zwracanie nowa zaktualizowana kopie
            return {
              ...interval,
              endTime: endTime,
              duration: duration,
            };
          }
          // W przeciwnym razie zwróc bez zmian
          return interval;
        }
      );

      // Zwracamy kompletnie nowy obiekt, który zastapi start stan todayData
      return {
        ...prevTodayData, // Skopiuj wszystkie właściwości (year,month,day,etc.)
        breakData: updatedBreakData, // Nadpiszd `breakData` nowa zaktualzowana tablica
        allBreakTime: prevTodayData.allBreakTime + duration, // Zaktaulizuj łaczny czas pracy
      };
    });

    // Rozpoczynanie spowrotem pracy
    startWork();
  };

  return (
    <div className="flex flex-col h-full">
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
      />
    </div>
  );
}

export default App;
