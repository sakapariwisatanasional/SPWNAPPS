import React from "react";
import {
  Home,
  Compass,
  CalendarDays,
  CreditCard,
  ShoppingBag,
  User,
  ShieldCheck,
  LogOut
} from "lucide-react";


/**
 * =====================================================
 * SPWN APPS V2
 * Sidebar Navigation
 * Saka Pariwisata UI
 * =====================================================
 */


interface SidebarProps {

  activePage?:
  string;


  onNavigate?:
  (page:string)=>void;


  isAdmin?:
  boolean;


  onLogout?:
  ()=>void;

}



const memberMenu = [

  {
    id:
    "dashboard",

    label:
    "Beranda",

    icon:
    Home,

  },


  {
    id:
    "krida",

    label:
    "Krida Saya",

    icon:
    Compass,

  },


  {
    id:
    "wisata",

    label:
    "Wisata",

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
    "Kartu Anggota",

    icon:
    CreditCard,

  },


  {
    id:
    "store",

    label:
    "Store",

    icon:
    ShoppingBag,

  },


  {
    id:
    "profile",

    label:
    "Profile",

    icon:
    User,

  },

];



const adminMenu = [

  {
    id:
    "admin",

    label:
    "Admin Panel",

    icon:
    ShieldCheck,

  },

];





export function Sidebar({

  activePage =
  "dashboard",

  onNavigate,

  isAdmin =
  false,

  onLogout,


}:SidebarProps){



const menus =
[
 ...memberMenu,
 ...(isAdmin ? adminMenu : [])
];



return (


<aside


className="

hidden

lg:flex

flex-col

w-72

min-h-screen

bg-white

border-r

border-gray-100

px-5

py-6

"

>


{/* BRAND */}


<div

className="

flex

items-center

gap-3

mb-8

"

>


<div

className="

w-12

h-12

rounded-2xl

bg-[#E31E24]

flex

items-center

justify-center

text-white

font-bold

text-xl

"

>

S

</div>



<div>


<h1

className="

font-bold

text-lg

text-gray-900

"

>

SPWN

</h1>


<p

className="

text-xs

text-gray-500

"

>

Saka Pariwisata

</p>


</div>


</div>





{/* MENU */}



<nav

className="

flex

flex-col

gap-2

flex-1

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

items-center

gap-4

px-4

py-3

rounded-2xl

transition-all

duration-300


${
active

?

"bg-red-50 text-[#E31E24] font-semibold"

:

"text-gray-600 hover:bg-gray-50"

}


`

}


>


<Icon

size={20}

/>


<span>

{item.label}

</span>


</button>


);


})

}


</nav>





{/* FOOTER */}



{

onLogout && (


<button


onClick={onLogout}


className="

flex

items-center

gap-3

px-4

py-3

rounded-2xl

text-gray-500

hover:bg-gray-50

transition

"

>


<LogOut

size={20}

/>


Keluar


</button>


)

}



</aside>


);


}
