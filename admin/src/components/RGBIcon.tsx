import type { SVGProps } from "react";
import { Ref, forwardRef } from "react";
import { useTheme, DefaultTheme } from "styled-components";

// 🧠 Augmentation locale du module pour typer `DefaultTheme`
declare module "styled-components" {
    export interface DefaultTheme {
        colors: {
            primary: string;
            secondary: string;
            background: string;
            text: string;
            [key: string]: string;
        };
    }
}

// 🖌️ Props typées avec les clés de ton thème
interface IconProps extends Omit<SVGProps<SVGSVGElement>, "fill" | "stroke"> {
    fill?: keyof DefaultTheme["colors"] | (string & {});
    stroke?: keyof DefaultTheme["colors"] | (string & {});
}

const SvgRGBIcon = (
    { fill: fillProp = "currentColor", stroke: strokeProp, ...props }: IconProps,
    ref: Ref<SVGSVGElement>
) => {
    const { colors } = useTheme();

    const fill =
        fillProp && fillProp in colors
            ? String(colors[fillProp as keyof DefaultTheme["colors"]])
            : String(fillProp);

    const stroke =
        strokeProp && strokeProp in colors
            ? String(colors[strokeProp as keyof DefaultTheme["colors"]])
            : String(strokeProp);

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width={16}
            height={16}
            fill={fill}
            stroke={stroke}
            ref={ref}
            {...props}
        >
            <circle cx="15.4" cy="10.7" r="8.9" />
            <path d="M25.7,13c-1,4.7-5.2,8.2-10.2,8.2s-1.2,0-1.8-.1c0,0,0,.2,0,.2,0,4.9,4,8.9,8.9,8.9s8.9-4,8.9-8.9-2.4-7-5.7-8.3Z" />
            <path d="M12.1,21.1h0c0,0,0-.6,0-.6-3.3-1.1-5.8-3.7-6.8-7.1-2.8,1.5-4.8,4.5-4.8,7.9,0,4.9,4,8.9,8.9,8.9s3.9-.7,5.4-1.8c-1.7-1.9-2.8-4.3-2.8-7s0-.1,0-.2Z" />
        </svg>
    );
};

export const RGBIcon = forwardRef(SvgRGBIcon);
