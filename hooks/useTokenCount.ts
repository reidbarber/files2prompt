import { useEffect, useState } from "react";

export const useTokenCount = (
  formattedOutput: string,
  encoding: any,
  delay: number = 500
) => {
  const [tokenCount, setTokenCount] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!formattedOutput) {
      setTokenCount(0);
      return;
    }

    setIsCalculating(true);
    const timeoutId = setTimeout(() => {
      try {
        const count = encoding.encode(formattedOutput).length;
        setTokenCount(count);
      } catch (error) {
        console.error("Error calculating token count:", error);
        setTokenCount(0);
      } finally {
        setIsCalculating(false);
      }
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      setIsCalculating(false);
    };
  }, [formattedOutput, encoding, delay]);

  return { tokenCount, isCalculating };
};
