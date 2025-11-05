import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {checktoken} from "@/Apicall/create"
export function Select() {
  let nav=useNavigate();

  /*useEffect( ()=>{
    let a=async ()=>{
        let resp=await checktoken();
        if(!resp)
        {
            nav("/login",{
                replace:true
            })

        }
        
       

    }
     a()

  },[])
  */

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <p className="lg:text-xl xl:text-2xl font-bold mt-2 font-[Geist_Mono]">Start your journey: Create a quiz, test your skills, or view performance</p>
          <div className="flex items-center gap-4">
            <AnimatedThemeToggler className={"z-32 mt-2"}/>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            
            <AnimatedThemeToggler className={"z-32 mt-2"}/>
          </MobileNavHeader>
          <p className="text-md  font-bold mt-4 ml-2 font-[Geist_Mono]">
            Start your journey: Create a quiz, test your skills, or  view performance</p>

          
        </MobileNav>
      </Navbar>
      
    </div> 
    <CardHoverEffectDemo/> 
    </>
  
  );
}
import { HoverEffect } from "./ui/card-hover-effect";

export function CardHoverEffectDemo() {
  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={projects} />
    </div>
  );
}
export const projects = [
 {
  title: "Create Quiz",
  description: "Design and publish engaging quizzes with ease — set questions, answers, and share instantly.",
  link: "http://localhost:5173/quiz",
}
,
  {
  title: "Take Quiz",
  description: "Join live or scheduled quizzes, test your knowledge, and challenge your friends in real time.",
  link: "http://localhost:5173/participate",
},
  {
  title: "View Analysis",
  description: "Track performance, view detailed results, and gain insights from your quiz history.",
  link: "http://localhost:5173/analysis",
},
  
];


