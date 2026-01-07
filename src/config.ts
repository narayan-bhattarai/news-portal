export interface AppConfig {
    backendUrl: string;
    siteName: string;
    siteTitle: string;
    favicon: string;
}

export let config: AppConfig = {
    backendUrl: "http://localhost:5200",
    siteName: "The Everest Edit",
    siteTitle: "The Everest Edit | The Height of Truth",
    favicon: "/vite.svg"
};

export const loadConfig = async () => {
    try {
        const response = await fetch('/config.json');
        if (response.ok) {
            const data = await response.json();
            if (data.backendUrl) config.backendUrl = data.backendUrl;
            if (data.siteName) config.siteName = data.siteName;
            if (data.siteTitle) config.siteTitle = data.siteTitle;
            if (data.favicon) config.favicon = data.favicon;
        }
    } catch (error) {
        console.warn('Failed to load config.json, using default configuration.', error);
    }
};
