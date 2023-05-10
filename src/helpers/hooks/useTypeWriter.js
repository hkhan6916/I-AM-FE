import { useEffect, useState } from "react";

const useTypewriter = (textArray, setCurrentText, currentText, disabled) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newLineTimeout, setNewLineTimeout] = useState(null);
  useEffect(() => {
    if (disabled || !textArray?.length) return;
    const handleTyping = () => {
      const currentString = textArray[currentIndex];

      if (currentText?.length < currentString.length) {
        setCurrentText(currentText + currentString.charAt(currentText?.length));
      } else {
        if (!newLineTimeout) {
          const timeout = setTimeout(() => {
            setCurrentText("");
            setCurrentIndex((currentIndex + 1) % textArray.length);
            setNewLineTimeout(null);
          }, 1000);
          setNewLineTimeout(timeout);
        }
      }
    };

    const timer = setInterval(handleTyping, 20);

    return () => clearInterval(timer);
  }, [currentIndex, textArray, disabled]);

  return [currentText];
};

export default useTypewriter;
