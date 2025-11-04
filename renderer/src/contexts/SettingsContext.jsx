/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext, useEffect } from "react";

const SettingsContext = createContext(null);

// Domyślny stan na wypadek, gdyby nic nie było w store
const DEFAULT_STATE = {
  breakInterval: 25,
  recommendExercises: true,
  exercises: [
    { id: 1, name: "Pompki", reps_min: 5, reps_max: 15 },
    { id: 2, name: "Przysiady", reps_min: 10, reps_max: 20 },
  ]
};

export const SettingsProvider = ({ children }) => {
  // --- STAN ---
  const [recommendExercises, setRecommendExercises] = useState(DEFAULT_STATE.recommendExercises);
  const [exercises, setExercises] = useState(DEFAULT_STATE.exercises);
  const [breakInterval, setBreakInterval] = useState(DEFAULT_STATE.breakInterval); // DODANE

  // zanim dane zostaną wczytane.
  const [isLoaded, setIsLoaded] = useState(false);


  // --- INTEGRACJA Z ELECTRON STORE ---

  // EFEKT 1: Wczytanie danych przy starcie aplikacji
  useEffect(() => {
    const loadSettings = async () => {
      // Sprawdzamy, czy API Electrona jest dostępne
      if (window.electronAPI && typeof window.electronAPI.getStoreValue === 'function') {
        try {
          const savedSettings = await window.electronAPI.getStoreValue('settings');

          if (savedSettings) {
            // Ustawiamy stan na podstawie wczytanych danych
            setRecommendExercises(savedSettings.recommendExercises ?? DEFAULT_STATE.recommendExercises);
            setExercises(savedSettings.exercises ?? DEFAULT_STATE.exercises);
            setBreakInterval(savedSettings.breakInterval ?? DEFAULT_STATE.breakInterval); // DODANE
          } else {
            // Jeśli nic nie ma w store, używamy domyślnych
            setRecommendExercises(DEFAULT_STATE.recommendExercises);
            setExercises(DEFAULT_STATE.exercises);
            setBreakInterval(DEFAULT_STATE.breakInterval)
          }
        } catch (error) {
          console.error("Nie udało się wczytać ustawień z Electron Store:", error);
          // W razie błędu również wracamy do domyślnych
          setRecommendExercises(DEFAULT_STATE.recommendExercises);
          setExercises(DEFAULT_STATE.exercises);
        }
      } else {
        console.warn("electronAPI.getStoreValue nie jest dostępne. Używam domyślnych ustawień.");
      }
      // Oznaczamy, że wczytywanie zakończone
      setIsLoaded(true);
    };

    loadSettings();
  }, []);

  // Zapisywanie danych przy każdej zmianie stanu
  useEffect(() => {
    // Nie zapisuj, jeśli dane nie zostały jeszcze wczytane
    if (!isLoaded) {
      return;
    }

    // Sprawdzam, czy API Electrona jest dostępne
    if (window.electronAPI && typeof window.electronAPI.setStoreValue === 'function') {
      const settingsToSave = {
        recommendExercises,
        exercises,
        breakInterval
      };
      // Zapisujemy aktualny stan do klucza 'settings'
      window.electronAPI.setStoreValue('settings', settingsToSave);
    } else {
      console.warn("electronAPI.setStoreValue nie jest dostępne. Ustawienia nie zostały zapisane.");
    }

  }, [recommendExercises, exercises, breakInterval, isLoaded]);


  // --- Funkcje modyfikujace stan ---

  const toggleRecomendExercises = () => {
    setRecommendExercises(prev => !prev);
  };

  const addExcercise = (exerciseData) => {
    const newExercise = {
      id: Date.now(),
      ...exerciseData
    };
    setExercises(prevExercises => [...prevExercises, newExercise]);
  };

  const deleteExercise = (idToDelete) => {
    setExercises(prevExercises =>
      prevExercises.filter(exercise => exercise.id !== idToDelete)
    );
  };

  const updateBreakInterval = (newInterval) => {
    const intervalAsNumber = parseInt(newInterval, 10)
    if (!isNaN(intervalAsNumber) && intervalAsNumber > 0) {
      setBreakInterval(intervalAsNumber);
    } else {
      // Jeśli ktoś wpisze bzdury, wracamy do domyślnej
      setBreakInterval(DEFAULT_STATE.breakInterval);
    }
  }

  // Obiekt value udostępniany przez kontekst
  const value = {
    recommendExercises,
    exercises,
    breakInterval,
    toggleRecomendExercises,
    addExcercise,
    deleteExercise,
    updateBreakInterval
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook do wygodnego krzystania z kontekstu
export const useSettings = () => {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }

  return context;
};

