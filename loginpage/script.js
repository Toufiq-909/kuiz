let index=0;
setInterval(()=>{
    let it=document.getElementById("hi");
    it.style.opacity=0;
    setTimeout(()=>{
        let img=["Blogging-bro.png","Blogging-cuate.png","Blogging-pana.png"];
        let it=document.getElementById("hi");
        if(index==3)
        {
            index=0;
        }
        it.src=img[index];
        it.style.opacity=1
        index++;
    },500)


},5000)
let p=document.getElementById("hello");
p.addEventListener("keyup",(event)=>{
    let parent=event.target.parentNode;
    let butt=parent.children[1];
    if(p.value!="")
    {
        butt.style.opacity="1";
        butt.style.cursor="pointer";
    }
    else
    {
        butt.style.opacity="0";
        butt.style.cursor="text";

    }


});
let butt='Show';
function pass()
{
    let pu=document.getElementById("hey");
   if(pu.innerHTML==="Show")
   {
       p.type="text";
       pu.innerHTML="Hide";
   }
   else
   {
       p.type="password";
       pu.innerHTML="Show";

   }

}
