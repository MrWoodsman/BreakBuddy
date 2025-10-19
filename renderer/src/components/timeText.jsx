export const TimeText = ({
  milliseconds,
  lethers = false,
  padStart = false,
}) => {
  // Zwracanie placeholdera jeśli nie istnaieje lub jest mniejsze niz 0
  if (isNaN(milliseconds) || milliseconds < 0) {
    return lethers ? "0s" : "00:00:00";
  }

  // Przekształcanie milisekund na godziny / minuty / sekundy
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // ======================================
  //            Format HH:MM:SS
  // ======================================
  if (!lethers) {
    if (!padStart) {
      return `${String(hours)}:${String(minutes)}:${String(seconds)}`;
    }
    // Dodawanie zer na początku
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  // ======================================
  //            Format 0h 0m 0s
  // ======================================
  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  // Sekundy pokazujemy zawsze
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(" ");
};
