"use client";


import {motion} from "framer-motion";
import Link from "next/link";


export default function Hero(){


return (

<section
className="
h-screen
flex
items-center
justify-center
px-6
"
>


<div className="text-center">


<motion.h1

initial={{
opacity:0,
y:80
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:1
}}

className="
text-[18vw]
leading-none
font-bold
tracking-[0.12em]
"

>

KIOYURT

</motion.h1>



<motion.p

initial={{
opacity:0
}}

animate={{
opacity:1
}}

transition={{
delay:.8
}}

className="
mt-10
text-lg
tracking-wide
text-neutral-500
"

>

AI Researcher · Developer · Creator

</motion.p>



<p
className="
mt-4
text-neutral-400
"
>

探索人工智能、多模态、计算机视觉
<br/>
记录研究、代码与思考

</p>



<Link

href="/articles"

className="
inline-block
mt-12
border
border-neutral-900
dark:border-neutral-100
px-8
py-3
rounded-full
hover:bg-neutral-900
hover:text-white
dark:hover:bg-white
dark:hover:text-black
transition
"

>

ENTER

</Link>


</div>


</section>

)

}