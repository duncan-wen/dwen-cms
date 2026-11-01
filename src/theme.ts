/**
 * The Reader's theme choice. With no stored choice the page has no `data-theme` and the
 * colour tokens follow the system preference; a stored choice sets `data-theme` on `<html>`.
 */
export type Theme = "light" | "dark";

export const themeStorageKey = "theme";

/**
 * Runs inline in `<head>` before the body is parsed, so a stored choice applies before the
 * first paint and the page never flashes the other theme.
 */
export const themeScript = `try{var t=localStorage.getItem(${JSON.stringify(themeStorageKey)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
