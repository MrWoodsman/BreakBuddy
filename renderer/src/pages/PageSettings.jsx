import React, { useState } from "react";

// --- STYLIZACJA SCROLLBARA I INPUTÓW ---
// Dodane nowe reguły CSS do ukrywania strzałek w polach numerycznych
const GlobalStyles = () => (
    <style jsx global>{`
        /* Stylizacja paska przewijania */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #a8a8a8; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #888; }

        /* --- NOWY KOD: Ukrywanie strzałek w input[type=number] --- */
        /* Dla przeglądarek WebKit (Chrome, Safari, Edge, Opera) */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }

        /* Dla przeglądarki Firefox */
        input[type=number] {
            -moz-appearance: textfield;
        }
    `}</style>
);


// --- GŁÓWNY KOMPONENT STRONY USTAWIEŃ ---
export const PageSettings = ({ closeSettings }) => {
    // Stany dla ustawień
    const [recommendExercises, setRecommendExercises] = useState(true);

    // Stan dla modala
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Stan dla listy ćwiczeń z nowymi polami
    const [exercises, setExercises] = useState([
        { id: 1, name: "Pompki", reps_min: 5, reps_max: 15 },
        { id: 2, name: "Przysiady", reps_min: 10, reps_max: 20 },
    ]);

    // --- Logika Ćwiczeń ---
    const handleAddNewExercise = (exerciseData) => {
        const newExercise = {
            id: Date.now(),
            ...exerciseData, // { name, reps_min, reps_max }
        };
        setExercises([...exercises, newExercise]);
        setIsModalOpen(false); // Zamknij modal po dodaniu
    };

    const handleDeleteExercise = (idToDelete) => {
        setExercises(exercises.filter(exercise => exercise.id !== idToDelete));
    };

    return (
        <>
            <GlobalStyles />
            {/* Modal do dodawania ćwiczeń */}
            {isModalOpen && (
                <AddExerciseModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleAddNewExercise}
                />
            )}

            <div className="page bg-neutral-100 font-sans h-screen overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    {/* Nagłówek */}
                    <div className="flex justify-between items-center p-4 sticky top-0 bg-neutral-100/80 backdrop-blur-sm z-10">
                        <button onClick={closeSettings} className="text-2xl font-bold text-neutral-500 hover:text-black">&times;</button>
                        <h1 className="text-xl font-bold">Ustawienia</h1>
                        <div className="w-8"></div>
                    </div>

                    <div className="p-4 space-y-8">
                        {/* Grupa "Wygląd" */}
                        <SettingsGroup title="Wygląd i dane">
                            <SettingsRow title="Wyczyść dane aplikacji">
                                <button className="px-3 py-1.5 rounded-md bg-red-500 text-white font-semibold text-sm hover:bg-red-600">
                                    Usuń
                                </button>
                            </SettingsRow>
                        </SettingsGroup>

                        {/* Grupa "Harmonogram Przerw" */}
                        <SettingsGroup title="Harmonogram przerw">
                            <SettingsRow title="Zalecane przerwy">
                                <div className="flex items-center">
                                    <p className="mr-2 text-neutral-600">Co</p>
                                    <input className="w-16 text-center px-2 h-9 border rounded-md border-neutral-300" type="number" defaultValue="25" />
                                    <p className="ml-2 text-neutral-600">minut</p>
                                </div>
                            </SettingsRow>
                            <SettingsRow title="Polecanie ćwiczeń">
                                <ToggleSwitch checked={recommendExercises} onChange={() => setRecommendExercises(!recommendExercises)} />
                            </SettingsRow>
                        </SettingsGroup>

                        {/* Grupa "Twoje Ćwiczenia" */}
                        <SettingsGroup
                            title="Twoje ćwiczenia"
                            actionButton={
                                <button onClick={() => setIsModalOpen(true)} className="text-blue-500 font-medium hover:text-blue-700">Dodaj nowe</button>
                            }
                        >
                            <div className="space-y-2 px-4 py-2">
                                {exercises.length > 0 ? (
                                    exercises.map(ex => (
                                        <ExerciseItem
                                            key={ex.id}
                                            exercise={ex}
                                            onDelete={() => handleDeleteExercise(ex.id)}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-neutral-500 py-4">Brak ćwiczeń. Dodaj swoje pierwsze ćwiczenie.</p>
                                )}
                            </div>
                        </SettingsGroup>
                    </div>
                </div>
            </div>
        </>
    );
};

// --- KOMPONENTY UI ---

// Nowy Modal do dodawania ćwiczeń
const AddExerciseModal = ({ onClose, onSave }) => {
    const [name, setName] = useState("");
    const [repsMin, setRepsMin] = useState(5);
    const [repsMax, setRepsMax] = useState(10);

    const handleSave = () => {
        if (name.trim() === "") {
            alert("Nazwa ćwiczenia nie może być pusta!");
            return;
        }
        onSave({ name, reps_min: parseInt(repsMin), reps_max: parseInt(repsMax) });
    };

    return (
        <div className="fixed inset-0 bg-black/50 p-4 backdrop-blur-[1px] flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Dodaj nowe ćwiczenie</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700">Nazwa ćwiczenia</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="np. Pajacyki"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700">Liczba powtórzeń</label>
                        <div className="flex items-center mt-1 space-x-2">
                            <input type="number" value={repsMin} onChange={(e) => setRepsMin(e.target.value)} className="w-full text-center p-2 border rounded-md" placeholder="Od" />
                            <span className="text-neutral-500">do</span>
                            <input type="number" value={repsMax} onChange={(e) => setRepsMax(e.target.value)} className="w-full text-center p-2 border rounded-md" placeholder="Do" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-neutral-200 hover:bg-neutral-300">Anuluj</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Zapisz</button>
                </div>
            </div>
        </div>
    );
};

// Komponent do wyświetlania pojedynczego ćwiczenia na liście
const ExerciseItem = ({ exercise, onDelete }) => (
    <div className="flex justify-between items-center bg-neutral-100 p-3 rounded-md">
        <div>
            <p className="font-semibold">{exercise.name}</p>
            <p className="text-sm text-neutral-500">Powtórzenia: {exercise.reps_min} - {exercise.reps_max}</p>
        </div>
        <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-xl font-bold">&times;</button>
    </div>
);

const SettingsGroup = ({ title, actionButton, children }) => (
    <section>
        <div className="flex justify-between items-baseline px-2 pb-2">
            <h2 className="text-lg font-bold text-neutral-800">{title}</h2>
            {actionButton}
        </div>
        <div className="bg-white rounded-lg border border-neutral-200/80 shadow-sm">
            {children}
        </div>
    </section>
);

const SettingsRow = ({ title, children }) => (
    <div className="flex justify-between items-center p-4 border-b border-neutral-200/70 last:border-b-0">
        <h3 className="w-full text-md text-neutral-800">{title}</h3>
        {children}
    </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-12 h-6 bg-neutral-300 rounded-full transition-colors peer-checked:bg-blue-600"></div>
        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
    </label>
);