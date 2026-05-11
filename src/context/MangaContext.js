import React, { createContext, useContext, useState, useCallback } from 'react';

const MangaContext = createContext(null);

export function MangaProvider({ children }) {
  const [library, setLibrary] = useState([]);

  const addToLibrary = useCallback((manga) => {
    setLibrary((prev) => {
      const exists = prev.some(
        (m) => m.id === manga.id || (manga.sourceUrl && m.sourceUrl === manga.sourceUrl)
      );
      if (exists) return prev;
      return [{ ...manga, addedAt: Date.now(), progress: 'En lecture', lastRead: null }, ...prev];
    });
  }, []);

  const removeFromLibrary = useCallback((id) => {
    setLibrary((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const isInLibrary = useCallback(
    (id) => library.some((m) => m.id === id),
    [library]
  );

  const updateProgress = useCallback((id, lastRead) => {
    setLibrary((prev) =>
      prev.map((m) => (m.id === id ? { ...m, lastRead } : m))
    );
  }, []);

  return (
    <MangaContext.Provider value={{ library, addToLibrary, removeFromLibrary, isInLibrary, updateProgress }}>
      {children}
    </MangaContext.Provider>
  );
}

export function useManga() {
  const ctx = useContext(MangaContext);
  if (!ctx) throw new Error('useManga must be used within MangaProvider');
  return ctx;
}
