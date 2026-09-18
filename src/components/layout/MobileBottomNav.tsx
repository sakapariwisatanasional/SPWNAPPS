import React from "react";

import {
  Home,
  Compass,
  CalendarDays,
  CreditCard,
  User
} from "lucide-react";



/**
 * =====================================================
 * SPWN APPS V2
 * Mobile Bottom Navigation
 *
 * Saka Pariwisata UI
 * =====================================================
 */



interface MobileBottomNavProps {


  activePage?:
  string;


  onNavigate?:
  (page:string)=>void;


}





const menus = [


  {

    id:
    "dashboard",

    label:
    "Home",

    icon:
    Home,

  },


  {

    id:
    "krida",

    label:
    "Krida",

    icon:
    Compass,

  },


  {

    id:
    "activity",

    label:
    "Aktivitas",

    icon:
    CalendarDays,

  },


  {

    id:
    "member-card",

    label:
    "Kartu",

    icon:
    CreditCard,

  },


  {

    id:
    "profile",

    label:
    "Profil",

    icon:
    User,

  },


];





export function MobileBottomNav({

  activePage =
  "dashboard",


  onNavigate,


}:MobileBottomNavProps){



return (



<nav


className="

fixed

bottom-0

left-0

right-0


z-50


lg:hidden


bg-white/95

backdrop-blur-md


border-t

border-gray-100


px-3

py-2


"

>


<div


className="

flex

items-center

justify-around

"

>


{


menus.map((item)=>{


const Icon =
item.icon;



const active =
activePage === item.id;



return (


<button


key={item.id}


onClick={()=>onNavigate?.(item.id)}


className={

`

flex

flex-col

items-center

justify-center


gap-1


min-w-[56px]

py-2


rounded-2xl


transition-all

duration-300


${
active

?

"text-[#E31E24] bg-red-50"

:

"text-gray-500"

}

`

}


>


<Icon

size={22}

strokeWidth={

active ? 2.5 : 2

}

/>


<span


className="

text-[11px]

font-medium

"

>


{item.label}


</span>



</button>


);


})

}


</div>



</nav>


);


}
