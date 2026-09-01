"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";


export default function HomeNav(){

const [open,setOpen]=useState(false);


return (

<header className="
fixed
top-0
left-0
right-0
z-50
px-8
py-6
">

<div className="
flex
justify-between
items-center
max-w-7xl
mx-auto
">


<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
className="
text-xl
font-semibold
tracking-[0.35em]
"
>
KIOYURT
</motion.div>



<button
onClick={()=>setOpen(true)}
>

<Menu size={26}/>

</button>


</div>



{
open &&
<motion.div

initial={{opacity:0}}
animate={{opacity:1}}

className="
fixed
inset-0
bg-[#f5f5f2]
dark:bg-[#0b0b0b]
flex
items-center
justify-center
"

>


<nav className="
space-y-8
text-5xl
font-medium
">


{
[
"HOME",
"ARTICLES",
"PROJECTS",
"SPACE",
"ABOUT",
"AI"
].map(item=>(

<motion.div
key={item}
whileHover={{
x:20
}}
className="cursor-pointer"
>

{item}

</motion.div>


))

}


</nav>


<button
className="
absolute
top-8
right-8
"
onClick={()=>setOpen(false)}
>
×
</button>


</motion.div>
}


</header>

)

}