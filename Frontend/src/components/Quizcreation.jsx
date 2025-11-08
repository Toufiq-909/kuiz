import { AnimatedThemeToggler } from "./ui/animated-theme-toggler"
import { WordRotate } from "@/components/ui/word-rotate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { generate,generate2 } from "../Apicall/create";
import {useNavigate} from "react-router-dom"
export function  Quiz()
{
  let num=useRef(0)
  let [check,setcheck]=useState(false);
  let set=useRef("")
  let [fill,setfill]=useState(false);
  let [des,setdes]=useState(false);
  let [m,sm]=useState(false);  
  let [pick,setpick]=useState("");
  let [questionsmsg,setquestionsmsg]=useState(false);
  let [setmsg,setsetmsg]=useState(false);
  let description=useRef("");
  let code=useRef("");
  let [msg,s]=useState("");
   const [levels, setLevels] = useState({
    easy: 33,
    medium: 33,
    hard: 34,
  });
  let nav=useNavigate();

  // Helper to rebalance percentages
  const handleChange = (type, value) => {
    let newValue = Math.min(100, Math.max(0, value));
    let others = ["easy", "medium", "hard"].filter((l) => l !== type);

    // Remaining percentage to distribute
    const remaining = 100 - newValue;
    const totalOthers = levels[others[0]] + levels[others[1]];

    // Distribute proportionally
    const updated = {
      [type]: newValue,
      [others[0]]: Math.round((levels[others[0]] / totalOthers) * remaining),
      [others[1]]: 100 - newValue - Math.round((levels[others[0]] / totalOthers) * remaining),
    };

    setLevels(updated);
  };
  


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
              <Textarea id="des" type="text" placeholder="Quiz on Cloud Computing"  onChange={(event)=>{
                description.current=event.target.value;
                s("");
              }}/>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="number">How Many Questions?</Label>
              <Input id="number" type="text" onChange={(event)=>{
                
                 s("");
                  let totalquestions=parseInt(event.target.value);
                  if(isNaN(totalquestions))
                  {
                    event.target.value=""
                  }
                  console.log(totalquestions);
                  num.current=totalquestions
                  if(totalquestions>50 || totalquestions<0)
                  {
                    num.current=50
                    setquestionsmsg(true);
                    event.target.value="50"
                  }
                  else if(event.target.value.length>2)
                  {
                    event.target.value=""
                  }
                  else
                  {
                    setquestionsmsg(false);
                  }
                }
              }/>
              {questionsmsg &&
              <p className={"text-yellow-400"}>Maximum 50 questions per Quiz!</p>
              }
            </div>
            <div className
            ="grid gap-2">
              <Label htmlFor="code">Secret Code</Label>
              <Input id="code" type="text" placeholder="This code ensures only invited users can join your quiz" onChange={(event)=>{
                code.current=event.target.value;
                s("");
              }}/>
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
                <Button className={"  cursor-pointer "+(fill ? "dark:bg-blue-600 dark:hover:bg-blue-600 ":"")+
                (fill ? "bg-purple-300 hover:bg-purple-300":"")} 
                type="button" variant={"secondary"} onClick={()=>{
                  setfill(prev=>!prev);

                  
                }}>MCQ</Button>
                <Button type="button" variant={"secondary"} className={"cursor-pointer "+(des ? "dark:bg-blue-600 dark:hover:bg-blue-600 ":"")+
                (des ? "bg-purple-300 hover:bg-purple-300":"")} onClick={()=>{
                  setdes(prev=>!prev);

                  
                }}>Descriptive</Button>
                <Button type="button" variant={"secondary"} className={"cursor-pointer "+(m ? "dark:bg-blue-600 dark:hover:bg-blue-600 ":"")+
                (m ? "bg-purple-300 hover:bg-purple-300":"")} 
                onClick={()=>{
                  sm(prev=>!prev);

                  
                }}>Fill in the Blank</Button>
               
              </div>
              
            </div>
        <div className="grid gap2">
          <Label htmlFor="nq" className="mb-2">Total Quiz Sets</Label>
              <Input id="nq" type="text" onChange={(event)=>{
 let setf=parseInt(event.target.value);
                  if(isNaN(setf))
                  {
                    event.target.value=""
                  }
                  console.log(setf);
                  set.current=setf
                  if(setf>10 || setf<0)
                  {
                    set.current=10
                    setsetmsg(true);
                    event.target.value="10"
                  }
                  else if(event.target.value.length>2)
                  {
                    event.target.value=""
                  }
                  else
                  {
                    setsetmsg(false);
                  }
                
              }}/>

              {setmsg &&
              <p className={"text-yellow-400"}>Maximum 10 unique Set's are allowed!</p>
              }
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
             

              <div className="flex flex-col gap-6 max-w-lg mx-auto p-6  bg-white w-[100%] rounded-2xl dark:bg-neutral-900 font-white">
      <h2 className="text-xl font-semibold mb-2 text-center">Set Difficulty Distribution</h2>

      {["easy", "medium", "hard"].map((level) => (
        <div key={level} className="flex flex-col gap-2">
          <label className="capitalize flex justify-between">
            <span>{level}:</span>
            <span>{levels[level]}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={levels[level]}
            onChange={(e) => handleChange(level, Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>
      ))}

      
    </div>
            

            
        </>
      }
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <RainbowButton className="w-full" onClick={async ()=>{
          s("")
         let res;
          if(!check)
          {
             res=await generate(description.current,num.current,code.current);
            if(res==400)
            {
              s("Invalid Details")

            }
            else if(res==401)
            {
              s("Weak Code!")

            }
            else if(res==500)
            {
              s("Erron in Generating Quiz,please try again")
            }
            else
            {
              s("Quiz has been generated Successfully");
              setTimeout(()=>{
                nav(
                  "/select"
                )

              },3000)
            }


          }
          else
          {
            //showing questions
            
            if(pick==="")
            {
              pick=levels.easy+"% easy "+levels.medium+"% medium "+levels.hard+"% hard";
              res=await generate2(description.current,num.current,code.current,fill,des,m,set.current,pick)
            }
            else if(pick==="beg")
            {
               pick="80% easy 20% medium"
                  res=await generate2(description.current,num.current,code.current,fill,des,m,set.current,pick)
            }
            else if(pick=="cas")
            {
               pick="50% easy 40% medium 10% hard"
                  res=await generate2(description.current,num.current,code.current,fill,des,m,set.current,pick)
            }
            else
            {
               pick="20% easy 30% medium 50% hard"
                  res=await generate2(description.current,num.current,code.current,fill,des,m,set.current,pick)

            }
            if(res==400)
            {
              s("Invalid Details")

            }
            else if(res==401)
            {
              s("Weak Code!")

            }
            else if(res==402)
            {
              s("Please Enter number of sets")
            }
            else if(res==23)
            {
              s("Please Configure difficulty level of the quiz")
            }
            else if(res==500)
            {
              s("Error in generating quiz,please try again")
            }
              else
            {
              s("Quiz has been generated Successfully");
              setTimeout(()=>{
                nav(
                  "/select"
                )

              },3000)
            }
            

          }
          

        }}>Create Instantly</RainbowButton>
      </CardFooter>
      
        <p className={"text-yellow-400 text-center"}>{msg}</p>
      
    </Card>
        </div>          
  </>
    )
}
