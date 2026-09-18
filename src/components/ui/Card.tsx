import React from "react";


/**
 * =====================================================
 * SPWN APPS V2
 * Global Card Component
 *
 * Saka Pariwisata Design System
 * =====================================================
 */


type CardVariant =
  | "default"
  | "interactive"
  | "outlined"
  | "glass";



interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {


  variant?:
    CardVariant;


  padding?:
    "none"
    |
    "sm"
    |
    "md"
    |
    "lg";


  children:
    React.ReactNode;

}





const variantStyle: Record<CardVariant,string> = {


  default:

  `
  bg-white
  shadow-[0_8px_24px_rgba(0,0,0,0.06)]
  `,


  interactive:

  `
  bg-white
  shadow-[0_8px_24px_rgba(0,0,0,0.06)]
  hover:
  -translate-y-1

  hover:
  shadow-[0_12px_32px_rgba(0,0,0,0.12)]

  cursor-pointer
  `,


  outlined:

  `
  bg-white
  border
  border-gray-200
  `,


  glass:

  `
  bg-white/80
  backdrop-blur-md
  shadow-lg
  `,

};





const paddingStyle = {


  none:
  "",


  sm:
  "p-3",


  md:
  "p-5",


  lg:
  "p-8",


};






export default function Card({

  variant =
    "default",


  padding =
    "md",


  children,


  className =
    "",


  ...props


}: CardProps){



return (


<div


{...props}


className={

`

rounded-[20px]

transition-all
duration-300


${variantStyle[variant]}


${paddingStyle[padding]}


${className}

`

}


>


{children}


</div>


);


}