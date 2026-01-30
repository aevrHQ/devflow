import * as React from "react";

export type TSVGElementProps = React.SVGProps<SVGSVGElement>;

const DevflowIcon: React.FC<
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
      d="M82.978 49.945h173.07V29h42.992v78.268h22.048v109.133H299.04V309H39.985v-92.599H17.938V107.268h22.047V29h42.993zM68.644 280.34h201.732V78.606h-79.373v14.33h-45.197v-14.33H68.644zm79.364-39.686h-42.992V131.52h42.992zm85.976 0h-42.992V131.52h42.992z"
    ></path>
    <defs>
      <linearGradient
        id="paint0_linear_476_126"
        x1="292.426"
        x2="43.293"
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

export default DevflowIcon;
