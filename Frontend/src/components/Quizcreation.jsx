import { AnimatedThemeToggler } from "./ui/animated-theme-toggler"
import { WordRotate } from "@/components/ui/word-rotate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShineBorder } from "@/components/ui/shine-border";
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RainbowButton } from "@/components/ui/rainbow-button";
import {useState,useRef} from "react";

export function  Quiz()
{
  let [num,snum]=useState("");
  let index=useRef(0);
  let [check,setcheck]=useState(false);
  let [nq,setnq]=useState("");
  let count=useRef(0);
  let [match,setmatch]=useState(false);
  let [fill,setfill]=useState(false);
  let [des,setdes]=useState(false);
  let [m,sm]=useState(false);  
  let [pick,setpick]=useState("");
  let easyindex=useRef(0);
  let [easy,seteasy]=useState("");
  let begindex=useRef(0);
  let [beg,setbeg]=useState("");
  let hardindex=useRef(0);
  let [hard,sethard]=useState("");
  let [questionsmsg,setquestionsmsg]=useState(false);


    return (
        <>
            <div className="">
            <div>
                <p className={"mt-12 text-center font-[roboto] text-2xl xl:mt-6 xl:text-3xl font-extrabold"}>Create engaging quizzes instantly and share them with anyone, anywhere.
                   </p>
                  
            </div>
            <AnimatedThemeToggler className={"absolute top-3 right-3 xl:right-18 xl:top-8"}/>

        </div>

        <div className="flex items-center mt-4">
                    <p className={"text-2xl xl:text-4xl   font-semibold  mr-2 font-[roboto] ml-4 sm:ml-38 md:ml-60 lg:ml-90 xl:ml-118"}>Kuiz is designed to be </p>
                        <WordRotate
    className={"text-2xl xl:text-4xl  font-bold font-[roboto]"}
      words={["Fast", "Smart","Interactive"]}
    />
                    </div> 

     <div className="flex justify-center mt-4  bg-red900">
        <Card className="relative overflow-hidden w-[40%]">
      <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
      <CardHeader>
        <CardTitle className={"text-center font-[roboto] text-2xl"}>Create Quizzes in Just One Click!</CardTitle>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="des">Describe Your Quiz</Label>
              <Textarea id="des" type="text" placeholder="Quiz on Cloud Computing" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="number">How Many Questions?</Label>
              <Input id="number" type="text" onChange={(event)=>{
                if(event.target.value.charAt(index.current)>='0'&& 
                event.target.value.charAt(index.current)<='9')
                {
                  snum(num=>num+event.target.value.charAt(index.current));
                  console.log(num);
                  let totalquestions=parseInt(num);
                  if(totalquestions>50)
                  {
                    snum("50");
                    setquestionsmsg(true);
                    event.target.value="50"
                  }
                  index.current=index.current+1;
                console.log(index.current+"sairam");
                }
                else{
                  event.target.value=num;
                }
              
                
              }}  onKeyDown={(event)=>{
                if(event.key==="Backspace")
                {
                  console.log("asdfasd");
                  snum(num=>num.substring(0,num.length-1));
                  index.current=Math.max(0, index.current - 1);
                  console.log(index.current);
                }

              }}/>
             
              {questionsmsg &&
              <p>hello</p>


              }
              
            </div>
            <div className="flex items-center gap-3 bgred-900">
        <Checkbox id="further" onClick={()=>{
          setcheck(prev=>!prev)
        }}/>
        <Label htmlFor="further">Anything Else?</Label>
      </div>
      {
        check &&<>
        
        <div className="grid gap-2">
              <Label>You Can Also Add:</Label>
              <div className={"flex justify-around"}>
                <Button className={"cursor-pointer "+(fill ? "dark:bg-blue-600 dark:hover:bg-blue-600 ":"")+
                (fill ? "bg-purple-300 hover:bg-purple-300":"")} 
                type="button" variant={"secondary"} onClick={()=>{
                  setfill(prev=>!prev);

                  
                }}>Fill in the Blank</Button>
                <Button type="button" variant={"secondary"} className={"cursor-pointer "+(des ? "dark:bg-blue-600 dark:hover:bg-blue-600 ":"")+
                (des ? "bg-purple-300 hover:bg-purple-300":"")} onClick={()=>{
                  setdes(prev=>!prev);

                  
                }}>Descriptive</Button>
                <Button type="button" variant={"secondary"} className={"cursor-pointer "+(m ? "dark:bg-blue-600 dark:hover:bg-blue-600 ":"")+
                (m ? "bg-purple-300 hover:bg-purple-300":"")} 
                onClick={()=>{
                  sm(prev=>!prev);

                  
                }}>MCQ</Button>
                <Button type="button" variant={"secondary"} className={"cursor-pointer "+(match ? "dark:bg-blue-600 dark:hover:bg-blue-600 ":"")+
                (match ? "bg-purple-300 hover:bg-purple-300":"")} 
                onClick={()=>{
                  setmatch(prev=>!prev);

                  
                }}>Match the following</Button>
              </div>
              
            </div>
        <div className="grid gap2">
          <Label htmlFor="nq" className="mb-2">Total Quiz Sets</Label>
              <Input id="nq" type="text" onChange={(event)=>{
                if(event.target.value.charAt(count.current)>='0'&& 
                event.target.value.charAt(count.current)<='9')
                {
                  setnq(nq+event.target.value.charAt(count.current));
                  console.log(nq);
                  count.current=count.current+1;
                console.log(count.current+"sairam");
                }
                else{
                  event.target.value=nq;
                }
              
                
              }}  onKeyDown={(event)=>{
                if(event.key==="Backspace")
                {
                  console.log("asdfasd");
                  setnq(nq=>nq.substring(0,nq.length-1));
                  count.current=Math.max(0,count.current - 1);
                  console.log(count.current);
                }

              }}/>
          </div>

         <div className="grid gap-2">
              <Label className="text-lg">Configure Your Quiz</Label>
              <Label className="text-center">Most Popular Picks!</Label>
              <Button type="button" variant="secondary" className={"flex flex-col justify-center items-start h-[10vh] "+(pick==="beg"? "border-6":"")} onClick={()=>{
                if(pick!="beg")
                {setpick("beg")

                }
                else{
                  setpick("");
                }
                
              }}>
                <p>Beginner</p>
                <p>8 Easy,2 Medium</p>
              </Button>
              <Button type="button" variant="secondary" className={"flex flex-col justify-center items-start h-[10vh] "+(pick==="cas"? "border-6":"")} onClick={()=>{
                if(pick!="cas")
                {setpick("cas")

                }
                else{
                  setpick("");
                }
                
              }}>
                <p>Casual</p>
                <p>5 Easy,4 Medium,1 Hard</p>
              </Button>
              <Button type="button" variant="secondary" className={"flex flex-col justify-center items-start h-[10vh] "+(pick==="cha"? "border-6":"")} onClick={()=>{
                if(pick!="cha")
                {setpick("cha")

                }
                else{
                  setpick("");
                }
                
              }}>
                <p>Challenge</p>
                <p>2 Easy,3 Medium,5 Hard</p>
              </Button>
            </div>
              <div className="py-3 flex items-center text-xs text-gray-400 uppercase before:flex-1 before:border-t before:border-gray-200 before:me-4 after:flex-1 after:border-t after:border-gray-200 after:ms-4">Or</div>
              <div className="grid gap-2">
              <Label >Easy Questions</Label>
            <Input id="easy" type="text" onChange={(event)=>{
                if(event.target.value.charAt(easyindex.current)>='0'&& 
                event.target.value.charAt(easyindex.current)<='9')
                {
                  seteasy(easy+event.target.value.charAt(easyindex.current));
                  console.log(easy);
                  easyindex.current=easyindex.current+1;
                console.log(easyindex.current+"sairam");
                }
                else{
                  event.target.value=easy;
                }
              
                
              }}  onKeyDown={(event)=>{
                if(event.key==="Backspace")
                {
                  console.log("asdfasd");
                  seteasy(easy=>easy.substring(0,easy.length-1));
                  easyindex.current=Math.max(0,easyindex.current - 1);
                  console.log(easyindex.current);
                }

              }}/>
              
            </div>
               <div className="grid gap-2">
              <Label >Medium Questions</Label>
            <Input  type="text" onChange={(event)=>{
                if(event.target.value.charAt(begindex.current)>='0'&& 
                event.target.value.charAt(begindex.current)<='9')
                {
                  setbeg(beg+event.target.value.charAt(begindex.current));
                  console.log(beg);
                  begindex.current=begindex.current+1;
                console.log(begindex.current+"sairam");
                }
                else{
                  event.target.value=beg;
                }                        
              }}  onKeyDown={(event)=>{
                if(event.key==="Backspace")
                {
                  console.log("asdfasd");
                  setbeg(beg=>beg.substring(0,beg.length-1));
                  begindex.current=Math.max(0,begindex.current - 1);
                  console.log(begindex.current);
                }
              }}/>
            </div>
               <div className="grid gap-2">
              <Label >Hard Questions</Label>
            <Input  type="text" onChange={(event)=>{
                if(event.target.value.charAt(hardindex.current)>='0'&& 
                event.target.value.charAt(hardindex.current)<='9')
                {
                  sethard(hard+event.target.value.charAt(hardindex.current));
                  console.log(hard);
                  hardindex.current=hardindex.current+1;
                console.log(hardindex.current+"sairam");
                }
                else{
                  event.target.value=hard;
                }
              }}  onKeyDown={(event)=>{
                if(event.key==="Backspace")
                {
                  console.log("asdfasd");
                  sethard(hard=>hard.substring(0,hard.length-1));
                  hardindex.current=Math.max(0,hardindex.current - 1);
                  console.log(hardindex.current);
                }
              }}/>
            </div>
        </>
      }
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <RainbowButton className="w-full">Create Instantly</RainbowButton>
      </CardFooter>
    </Card>
        </div>          
  </>
    )
}
