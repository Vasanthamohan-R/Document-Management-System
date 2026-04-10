import * as lucideIcons from "lucide-react";
import { twMerge } from "tailwind-merge";

export const { icons } = lucideIcons;

interface LucideProps extends React.ComponentPropsWithoutRef<"svg"> {
    icon?: keyof typeof icons;
    title?: string;
    color?: string;
}

function Lucide(props: LucideProps) {
    const { icon, strokeWidth, color, className, ...computedProps } = props;
    const Component = icon ? icons[icon] : null;
    if (!Component) {
        return null;
    }
    return (
        <Component
            {...computedProps}
            strokeWidth={strokeWidth ?? 1.5}
            //   color={color ?? "white"}
            color={"currentColor"}
            className={twMerge(["w-5 h-5", props.className])}
        />
    );
}

export default Lucide;
