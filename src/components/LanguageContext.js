import React, { createContext, useState } from "react";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    document.dir = newLanguage === "ar" || newLanguage === "ku" ? "rtl" : "ltr";
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
