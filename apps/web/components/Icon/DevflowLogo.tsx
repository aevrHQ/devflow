import * as React from "react";

export type TSVGElementProps = React.SVGProps<SVGSVGElement>;

const DevflowLogo: React.FC<
  TSVGElementProps & {
    useGradient?: boolean;
  }
> = ({ useGradient = true, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="338"
    height="338"
    fill="none"
    viewBox="0 0 338 338"
    {...props}
  >
    <path
      fill={useGradient ? "url(#paint0_linear_476_126)" : "currentColor"}
      d="M63 74h213.191v213.191H63z"
    ></path>
    <path
      fill={useGradient ? "url(#paint1_linear_476_126)" : "currentColor"}
      d="M83.04 49.945h173.07V29h42.993v78.268h22.047v109.133h-22.047V309H40.048v-92.599H18V107.268h22.048V29H83.04zM68.706 280.34h201.732V78.606h-79.373v14.33h-45.197v-14.33H68.706z"
    ></path>
    <path
      fill="#fff"
      d="M191.055 131.52h42.992v109.134h-42.992zM105.078 131.52h42.992v109.134h-42.992z"
    ></path>
    <defs>
      <linearGradient
        id="paint0_linear_476_126"
        x1="276.191"
        x2="276.191"
        y1="286.903"
        y2="63.515"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#0F172B"></stop>
        <stop offset="1" stopColor="#303D5D"></stop>
      </linearGradient>
      <linearGradient
        id="paint1_linear_476_126"
        x1="292.489"
        x2="43.355"
        y1="29"
        y2="299.079"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FBA11A"></stop>
        <stop offset="1" stopColor="#F70A6D"></stop>
      </linearGradient>
    </defs>
  </svg>
);

export default DevflowLogo;
