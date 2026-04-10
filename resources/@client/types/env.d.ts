interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_CLIENT_ID: string;
    readonly VITE_CLIENT_SECRET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module "*.css" {
    const content: { [className: string]: string };
    export default content;
}
