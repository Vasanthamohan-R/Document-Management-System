declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "react-datepicker" {
    import { ComponentType } from "react";
    const DatePicker: ComponentType<any>;
    export default DatePicker;
}

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_CLIENT_ID: string;
    readonly VITE_CLIENT_SECRET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
