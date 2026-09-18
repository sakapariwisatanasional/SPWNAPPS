import React from "react";


/**
 * =====================================================
 * SPWN APPS V2
 * Global Button Component
 * Saka Pariwisata Design System
 * =====================================================
 */


type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghost";


type ButtonSize =
  | "sm"
  | "md"
  | "lg";



interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {


  variant?:
    ButtonVariant;


  size?:
    ButtonSize;


  loading?:
    boolean;


  icon?:
    React.ReactNode;


  children:
    React.ReactNode;

}




const variantStyle: Record<ButtonVariant,string> = {


  primary:

    `
    bg-[#E31E24]
    text-white
    hover:bg-[#B91C1C]
    shadow-sm
    `,


  secondary:

    `
    bg-white
    text-[#E31E24]
    border
    border-[#E31E24]
    hover:bg-red-50
    `,


  accent:

    `
    bg-[#00A8A8]
    text-white
    hover:bg-[#008B8B]
    `,


  ghost:

    `
    bg-transparent
    text-gray-700
    hover:bg-gray-100
    `,

};




const sizeStyle: Record<ButtonSize,string> = {


  sm:

    `
    px-3
    py-2
    text-sm
    `,


  md:

    `
    px-5
    py-3
    text-base
    `,


  lg:

    `
    px-6
    py-4
    text-lg
    `,

};






export default function Button({

  variant =
    "primary",


  size =
    "md",


  loading =
    false,


  icon,


  children,


  disabled,


  className =
    "",


  ...props


}: ButtonProps){



return (


<button


{...props}


disabled={
  disabled || loading
}



className={

`
inline-flex
items-center
justify-center
gap-2

font-semibold

rounded-[14px]

transition-all
duration-300

active:scale-95

disabled:
opacity-50

disabled:
cursor-not-allowed


${variantStyle[variant]}


${sizeStyle[size]}


${className}

`

}


>


{


loading && (

<span

className="
h-4
w-4
rounded-full
border-2
border-white
border-t-transparent
animate-spin
"

/>

)



}


{


!loading && icon && (

<span>

{icon}

</span>

)

}



<span>

{children}

</span>



</button>


);


}