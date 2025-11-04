import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
import { useNavigate } from "react-router-dom";
import {useRef,useState} from"react";
import { check,login } from "@/Apicall/create.js";

  function Cardi() {
    let nav=useNavigate(); 
    let mail=useRef("");
    let password=useRef("");
    let [msg,setmsg]=useState("");
    let [showpassword,changeshow]=useState(false);
    

  return (
    <Card className="w-full max-w-sm">
        
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
         
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="we@example.com"
                required
               onChange={(event)=>{
                mail.current=event.target.value;
               }}/>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="/"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type={showpassword?"text":"password"} required onChange={(event)=>{
               password.current=event.target.value;
               
              }}
              onMouseEnter={()=>{
                changeshow(true);

              }}
              onMouseLeave={()=>{
                changeshow(false);
              }}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit"  className="w-full cursor-pointer" onClick={async()=>{
         let status=await login(mail.current,password.current);
         if(status==500)
         {
          setmsg("Server issues");
         }
         else if(status==401)
         {
          setmsg("Invalid credentails")
         }
         else
         {
          nav("/select")
         }
        }}>
          Login
        </Button>
        <Button type="submit" variant={"secondary"} className="w-full cursor-pointer" onClick={()=>{
            nav("/create")
          }}>
          Sign Up?
        </Button>
        <p className="text-red-400">
          {msg}
        </p>
      </CardFooter>
    </Card>
  )
}
function Cardt()
{
    let nav=useNavigate();
    let mail=useRef("");
    let password=useRef("");
    let [msg,setmsg]=useState("");
    let [showpassword,changeshow]=useState(false);

    return (
    <Card className="w-full max-w-sm hover:z-50">
       
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your email below to create to your account
        </CardDescription>
        <CardAction>
         
          
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="we@example.com"
                required
                onChange={(event)=>{
                    mail.current=event.target.value;
                }}/>
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
               
              </div>
              <Input id="password" type={showpassword?"text":"password"} required onChange={(event)=>{
               password.current=event.target.value;
               
              }}
              onMouseEnter={()=>{
                changeshow(true);

              }}
              onMouseLeave={()=>{
                changeshow(false);
              }}
              />
            </div>
           
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className={"w-full cursor-pointer"} onClick={async ()=>{
            let res=await check(mail.current,password.current);
            if(res==400)
            {
                setmsg("Weak Password,it should have atleast 5 characters.");
            }
            else if(res==409)
            {
                setmsg("This Email Id is already in use,try something else!")
            }
            else if(res==401)
            {
              setmsg("Invalid Email Address");
            }
            else if(res==402)
            {
              setmsg("Password is too long!")
            }
            else if(res==500)
            {
              setmsg("Server Issuse")
            }
            else 
            {
                setmsg("");
                localStorage.setItem("email",mail.current);
                localStorage.setItem("pass",password.current);
                nav("/otp")
                
            }

            

        }}>
          Create Account
        </Button>
        <Button type="submit" variant={"secondary"} className="w-full cursor-pointer" onClick={()=>{
           nav("/login")
          }}>
          Sign In?
        </Button>
        
      </CardFooter>
      <p className="text-rose-500 text-center">{msg}</p>
      
      
    </Card>
  )
}

export function Signin()
{
    return (
        <>
        <AnimatedThemeToggler className={"m-4 cursor-pointer"}/>
        <div className={"bg-red900 flex justify-center h-[80vh] items-center"}>
          
            <Cardi />
        </div>
        
        </>
    )
}
export function Create()
{
    
    return (
        <>
          <AnimatedThemeToggler className={"m-4 cursor-pointer"}/>
        <div className={"bg-red900 flex justify-center h-[80vh] items-center "}>
            <Cardt />
        </div>
        </>
    )
}
