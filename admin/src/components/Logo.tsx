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

const SvgLogo = (
  { fill: fillProp = "currentColor", stroke: strokeProp, ...props }: IconProps,
  ref: Ref<SVGSVGElement>
) => {
  const { colors } = useTheme();

  const fill =
    fillProp && fillProp in colors
      ? colors[fillProp as keyof DefaultTheme["colors"]]
      : fillProp;

  const stroke =
    strokeProp && strokeProp in colors
      ? colors[strokeProp as keyof DefaultTheme["colors"]]
      : strokeProp;

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
      <path d="M29.5,3H7.4c-1.4,0-2.5,1.1-2.5,2.4v2.4h-2.5c-1.4,0-2.5,1.1-2.5,2.4v16.5c0,1.3,1.1,2.4,2.5,2.4h22.2c1.4,0,2.5-1.1,2.5-2.4v-2.4h2.5c1.4,0,2.5-1.1,2.5-2.4V5.4c0-1.3-1.1-2.4-2.5-2.4ZM21.6,9.7l2.3-2.3c.3-.3.8-.3,1.1,0h0c.3.3.3.8,0,1.1l-2.3,2.3c-.3.3-.8.3-1.1,0-.3-.3-.3-.8,0-1.1ZM18,5.8c0-.4.4-.8.8-.8s.8.4.8.8v3.3c0,.4-.4.8-.8.8s-.8-.4-.8-.8v-3.3ZM18,18.2c0-.4.4-.8.8-.8s.8.4.8.8v3.3c0,.4-.4.8-.8.8s-.8-.4-.8-.8v-3.3ZM12.6,7.4c.3-.3.8-.3,1.1,0h0l2.3,2.3c.3.3.3.8,0,1.1-.3.3-.8.3-1.1,0l-2.3-2.3c-.3-.3-.3-.8,0-1.1ZM16,17.5l-2.3,2.3c-.3.3-.8.3-1.1,0-.3-.3-.3-.8,0-1.1l2.3-2.3c.3-.3.8-.3,1.1,0,.3.3.3.8,0,1.1h0ZM11,12.8h3.3c.4,0,.8.4.8.8s-.4.8-.8.8h-3.3c-.4,0-.8-.4-.8-.8s.4-.8.8-.8ZM24.6,26.6H2.5V10.1h2.5v11.8c0,1.3,1.1,2.4,2.5,2.4h17.2v2.4ZM25,19.8c-.3.3-.8.3-1.1,0l-2.3-2.3c-.3-.3-.3-.8,0-1.1.3-.3.8-.3,1.1,0l2.3,2.3c.3.3.3.8,0,1.1ZM26.6,14.4h-3.3c-.4,0-.8-.4-.8-.8s.4-.8.8-.8h3.3c.4,0,.8.4.8.8s-.4.8-.8.8Z" />
    </svg>
  );
};

export const Logo = forwardRef(SvgLogo);
