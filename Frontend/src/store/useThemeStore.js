import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('theme-name') || "coffee", //vallue

  //setter function

  setTheme: (theme)=> {
    set({theme})
    localStorage.setItem("theme-name",theme)
  }
}))
