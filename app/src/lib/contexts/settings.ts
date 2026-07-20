// settingsContext.ts
import { createContext } from 'svelte';

export const [getSettings, setSettings] = createContext<App.PageState['settings']>();
