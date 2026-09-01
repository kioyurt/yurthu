"use client";


const articles=[

{
title:"多模态视觉增强模型设计",
date:"2026.08.10"
},

{
title:"Diffusion模型中的条件控制研究",
date:"2026.08.01"
},

{
title:"我的HomeLab搭建记录",
date:"2026.07.20"
}

];


export default function ArticleList(){


return (

<section
className="
max-w-5xl
mx-auto
px-6
py-32
"
>


<h2
className="
text-sm
tracking-[0.4em]
text-neutral-400
"
>

LATEST

</h2>



<div
className="
mt-10
"
>


{
articles.map((a,i)=>(


<div

key={i}

className="
group
border-b
py-8
flex
justify-between
hover:px-4
transition
"

>


<h3
className="
text-xl
group-hover:text-neutral-500
"
>

{a.title}

</h3>


<span
className="
text-neutral-400
"
>

{a.date}

</span>



</div>


))
}


</div>


</section>


)

}