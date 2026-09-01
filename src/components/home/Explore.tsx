"use client";


import Link from "next/link";
import {motion} from "framer-motion";


const items=[

{
title:"ARTICLES",
desc:"研究笔记与技术文章",
href:"/articles"
},

{
title:"PROJECTS",
desc:"开源项目与实验",
href:"/projects"
},

{
title:"SPACE",
desc:"我的数字空间",
href:"/space"
},

{
title:"AI",
desc:"知识库与智能助手",
href:"/ai"
}

];



export default function Explore(){


return (

<section
className="
max-w-6xl
mx-auto
px-6
py-32
"
>


<h2
className="
tracking-[0.4em]
text-sm
text-neutral-400
"
>

EXPLORE

</h2>



<div
className="
mt-12
divide-y
divide-neutral-300
dark:divide-neutral-800
"
>


{
items.map((item,i)=>(


<Link
href={item.href}
key={item.title}
>

<motion.div

whileHover={{
x:20
}}

className="
py-8
flex
justify-between
items-center
cursor-pointer
"

>


<div>

<h3
className="
text-5xl
font-medium
"
>

{item.title}

</h3>


<p
className="
mt-3
text-neutral-400
"
>

{item.desc}

</p>


</div>



<span>
→
</span>



</motion.div>


</Link>


))
}


</div>


</section>

)

}