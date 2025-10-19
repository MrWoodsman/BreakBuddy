// ========================================
//        Odwołanie do elementów UI
// ========================================
const btnStartWork = document.getElementById("btnStartWork");
const btnStartBreak = document.getElementById("btnStartBreak");
const btnEndWork = document.getElementById("btnEndWork");
const btnEndBreak = document.getElementById("btnEndBreak");

// ========================================
//          Ustawienie aplikacji
// ========================================
const initializeApp = () => {
  // Ustaiwanie odpowiednich przycisków
  btnStartWork.style.display = "block";
  btnStartBreak.style.display = "none";
  btnEndWork.style.display = "none";
  btnEndBreak.style.display = "none";
};

initializeApp();
