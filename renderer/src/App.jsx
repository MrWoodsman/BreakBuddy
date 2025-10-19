import { ActionButtons } from "./components/actionButtons";
import { Informations } from "./components/informations";
import { Timer } from "./components/timers";

function App() {
  return (
    <div className="flex flex-col h-full">
      {/* TIMERS */}
      <Timer />
      {/* INFORMATIONS */}
      <Informations />
      {/* ACTIONS BUTTONS */}
      <ActionButtons />
    </div>
  );
}

export default App;
