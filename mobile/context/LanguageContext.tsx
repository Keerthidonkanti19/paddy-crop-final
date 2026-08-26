import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type LanguageCode =
  | "en"
  | "te"
  | "hi"
  | "ta"
  | "kn";

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
};

const LANGUAGE_KEY = "khet_saathi_language";

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguageState] =
    useState<LanguageCode>("en");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage =
        await AsyncStorage.getItem(LANGUAGE_KEY);

      if (
        savedLanguage === "en" ||
        savedLanguage === "te" ||
        savedLanguage === "hi" ||
        savedLanguage === "ta" ||
        savedLanguage === "kn"
      ) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.log(
        "Failed to load language:",
        error
      );
    }
  };

  const setLanguage = async (
    newLanguage: LanguageCode
  ) => {
    try {
      setLanguageState(newLanguage);

      await AsyncStorage.setItem(
        LANGUAGE_KEY,
        newLanguage
      );
    } catch (error) {
      console.log(
        "Failed to save language:",
        error
      );
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}