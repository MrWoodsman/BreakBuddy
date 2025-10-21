// components/Button.jsx

// Dodajemy propsy 'variant' i 'className'
export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
}) => {
  // 1. Podstawowe, wspólne style dla wszystkich wariantów
  const baseStyles =
    "font-bold py-2 px-4 rounded focus:outline-none transition-colors";

  // 2. Style specyficzne dla wariantów
  const variantStyles = {
    primary: "bg-blue-500 hover:bg-blue-700 text-white",
    secondary: "bg-gray-300 hover:bg-gray-400 text-black",
    danger: "bg-red-500 hover:bg-red-700 text-white",
  };

  // 3. Łączymy wszystkie klasy
  const combinedClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${className}
  `;

  return (
    <button onClick={onClick} className={combinedClasses}>
      {children}
    </button>
  );
};
