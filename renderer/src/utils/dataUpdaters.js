export const endLastInterval = ({ setTodayData, arrayKey, totalTimeKey }) => {
  const endTime = Date.now();

  setTodayData((prevTodayData) => {
    // Uzycie arrayKey do dynamicznego pobierania
    const targetArray = prevTodayData[arrayKey];
    // Obliczamy wartoscv na podstawie tej tablicy
    const lastInterval = targetArray[targetArray.length - 1];
    // ZABEZPIECZNIe: jesli z jakiegos powodu tablica jesty pusta
    if (!lastInterval) return prevTodayData;

    const duration = endTime - lastInterval.startTime;

    // Towrzenie nowej zaktualiuzowanej tablicy
    const updatedArray = targetArray.map((interval, index) => {
      if (index === targetArray.length - 1) {
        return {
          ...interval,
          endTime: endTime,
          duration: duration,
        };
      }
      return interval;
    });

    // Zwracan ie noewgo obvvielit stanu
    return {
      ...prevTodayData,
      [arrayKey]: updatedArray,
      [totalTimeKey]: prevTodayData[totalTimeKey] + duration,
    };
  });
};
