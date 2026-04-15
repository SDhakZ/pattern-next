import { createContext, useContext, useReducer } from "react";
import { reducer, initialState } from "./reducer.js";
import { THEMES } from "../data/constants/themes.js";

export const PatternsOfPlaceContext = createContext(null);

export function PatternsOfPlaceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <PatternsOfPlaceContext.Provider value={{ state, dispatch }}>
      {children}
    </PatternsOfPlaceContext.Provider>
  );
}

/** Returns { state, dispatch, T } — T is the resolved theme token object. */
export function usePatternsOfPlace() {
  const ctx = useContext(PatternsOfPlaceContext);
  if (!ctx) throw new Error("usePatternsOfPlace must be used inside PatternsOfPlaceProvider");
  const T = THEMES[ctx.state.ui.theme];
  return { state: ctx.state, dispatch: ctx.dispatch, T };
}
