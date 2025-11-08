import {z} from "zod";
const api=import.meta.env.VITE_API_Auth;
const api2=import.meta.env.VITE_API_Quiz;
export async function  check(a,b)
{

    let validuser=z.object({
        a:z.email(),
        b:z.string().min(5).max(24)
    })
    let result=validuser.safeParse({
        a:a,
        b:b
    })
    if(result.success)
    {
          let res=await fetch(api+"/check",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:a
        })
    }) 
         if(res.status==200)
         {
            let res1=await fetch(api+"/otp",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email:a
                })
            })
            return res1.status;

         }
         return res.status;
    }
    else
    {
        if(result.error.issues[0].message==="Invalid email address")
        {
            return 401;
        }
        else
        {
            if(b.length<5)
            {
                return 400;
            }
            console.log("asdfasdf")
            return 402;
        }

    }
    //check passswowrd and mail

  
}
export async function verify(email,password,otp)
{
    let resp=await fetch(api+"/verify",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
        email:email,
        password:password,
        otp:otp
        })
        

    })
    if(resp.status==200)
    {
         let res=await resp.text()
    console.log(res);
        localStorage.setItem("token",res);
    }
   
    
    return resp.status;
}
export async function Sendagain(email)
{
    let resp=await fetch(api+"/updateotp",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:email
        })

    });
    return resp.status;
}
export async function login(email,password)
{
    let valid=z.object({
        email:z.email(),
        password:z.string().min(5).max(24)
    });
    let result=valid.safeParse({
        email:email,
        password:password
    })
    if(result.success)
    {

        let resp=await fetch(api+"/signin",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            email:email,
            password:password
        })
    });
    if(resp.status==200)
    {
        let token=await resp.text();
        localStorage.setItem("token",token);

    }
    return resp.status;

    }
    else
    {
        return 401
    }
    
}

export async function checktoken()
{
    let token=localStorage.getItem("token");
    if(token==null)
    {
        return false;
    }
    else
    {
        let resp=await fetch(api+"/verifyjwt?token="+localStorage.getItem("token"));
        if(resp.status==200)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}
export async function generate(des,n,code)
{
    
    if(des.length<5 || parseInt(n)<5)
    {
        return 400;
    }
    else if(code.length<2)
    {
        return 401;
    }
    else
    {
      

        let resp=await fetch(api2+"/generateQuiz",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
    Description:des,
    Total_Questions:n.toString(),
    Anything_Else:"No",
    QUESTION_TYPES:"",
    difficulty:"40 % easy 20% hard 40 % medium",
    sets:"1",
    code:code
})
        })
        if(resp.status==200)
        {
            let res=await resp.json();
            return res;

        }
        else
        {
        return resp.status;
        }
       
    }
}

export async function  generate2(des,n,code,fill,p,m,set,pick)
{
if(des.length<5 || parseInt(n)<5)
    {
        return 400;
    }
    else if(code.length<2)
    {
        return 401;
    }
    else if(set=="")
    {
        return 402;
    }
    else if(pick=="")
    {
        return 23;
    }
    else
    {

        let type="";
        if(fill)
            {
                type="Multiple correct answers"
            }
            if(p)
            {
                type=type+" short_answer"
            }
            if(m)
            {
                type=type+" fill in the blanks"

            }
          

       


        let resp=await fetch(api2+"/generateQuiz",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
    Description:des,
    Total_Questions:n.toString(),
    Anything_Else:"Yes",
    QUESTION_TYPES:type,
    difficulty:pick,
    sets:set.toString(),
    code:code
})
        })
        if(resp.status==200)
        {
            let res=await resp.json();
            return res;

        }
        else
        {
        return resp.status;
        }
    }
}