"use client";

import {motion} from "framer-motion";


export default function About(){


return (

<section
className="
max-w-5xl
mx-auto
px-6
py-32
"
>


<motion.h2

initial={{
opacity:0
}}

whileInView={{
opacity:1
}}

className="
text-sm
tracking-[0.4em]
text-neutral-400
"

>

ABOUT

</motion.h2>



<div
className="
mt-10
text-4xl
leading-relaxed
max-w-3xl
"
>

我是 kioyurt

<br/>

一名关注

<span className="text-neutral-400">
人工智能、多模态学习、计算机视觉
</span>

的研究者。


</div>



</section>

)

}