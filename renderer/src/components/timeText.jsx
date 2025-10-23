import NumberFlow, { NumberFlowGroup } from "@number-flow/react";

/**
 * Komponent do wyświetlania czasu z animacją liczb.
 * @param {object} props
 * @param {number} props.milliseconds - Czas w milisekundach do sformatowania.
 * @param {boolean} [props.letters=false] - Jeśli true, formatuje czas jako "1h 2m 3s". W przeciwnym razie "01:02:03".
 * @param {boolean} [props.padStart=false] - Jeśli true (i `letters` jest false), dodaje wiodące zera (np. 01 zamiast 1).
 */
export const TimeText = ({ milliseconds, letters = false, padStart = false }) => {
  // Zwracanie placeholdera, jeśli wartość jest nieprawidłowa
  if (isNaN(milliseconds) || milliseconds < 0) {
    return <span>{letters ? "0s" : "00:00:00"}</span>;
  }

  // Przekształcanie milisekund na godziny / minuty / sekundy
  const totalSeconds = Math.round(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // ======================================
  //       Format HH:MM:SS
  // ======================================
  if (!letters) {
    return (
      <NumberFlowGroup>
        <NumberFlow value={hours} pad={padStart ? 2 : 0} />
        <span>:</span>
        <NumberFlow value={minutes} pad={padStart ? 2 : 0} />
        <span>:</span>
        <NumberFlow value={seconds} pad={padStart ? 2 : 0} />
      </NumberFlowGroup>
    );
  }

  // ======================================
  //       Format 0h 0m 0s
  // ======================================
  return (
    <NumberFlowGroup>
      {/* Wyświetlaj tylko, gdy godziny są większe od zera */}
      {hours > 0 && (
        <>
          <NumberFlow value={hours} suffix="h" />
          <span> </span>
        </>
      )}

      {/* Wyświetlaj, gdy minuty lub godziny są większe od zera */}
      {(minutes > 0 || hours > 0) && (
        <>
          <NumberFlow value={minutes} suffix="m" />
          <span> </span>
        </>
      )}

      {/* Sekundy wyświetlaj zawsze, co zapobiega migotaniu */}
      <NumberFlow value={seconds} suffix="s" />
    </NumberFlowGroup>
  );
};
