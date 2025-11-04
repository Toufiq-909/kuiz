use axum::{
    routing::{get,post},
    Router,
    Json,
    http::StatusCode,
    response::{IntoResponse}
};
use serde_json::json;
use reqwest::Client;

use serde::Deserialize;
use surrealdb::engine::any;
use surrealdb::opt::auth::Root;
use surrealdb::engine::any::Any;
use surrealdb::Surreal;
use app_state::{AppState,AppStateTrait,InitAppState,stateful};
use uuid::Uuid;
use dotenv::dotenv;
use std::env;
#[derive(Debug, Deserialize,serde::Serialize)]
struct Set {
    questions: Vec<Question>,
}
#[derive(Debug, Deserialize,serde::Serialize)]
struct Quiz{
    set:Vec<Set>
}

#[derive(Debug, Deserialize,serde::Serialize)]
struct Question {
    question: String,
    options: Vec<String>,
    correct_answer: String,
    explanation: String,
    difficulty: String,
    question_type: String,
}
#[derive(InitAppState)]
struct Mydb
{
    db:Surreal<Any>
}
#[derive(serde::Serialize,Deserialize)]
struct check
{
    why:String
}
#[derive(serde::Serialize,Deserialize)]
struct Questiondoc
{
    qid:String,
    set:u32,
    question:String,
    options:Vec<String>,
    Ans:String,
    explanation:String,
    difficulty:String,
    question_type:String

}
#[derive(serde::Serialize,Deserialize)]
struct Request
{
    Description:String,
    Total_Questions:String,
    Anything_Else:String,
    QUESTION_TYPES:String,
    sets:String,
    difficulty:String
}

#[tokio::main]

async fn main()
{
    dotenv().ok();
    let db=any::connect(env::var("db").unwrap()).await.unwrap();
    db.use_ns(env::var("ns").unwrap()).use_db(env::var("database").unwrap()).await.unwrap();
    db.signin(Root{
        username:&env::var("user").unwrap(),
        password:&env::var("password").unwrap()
    }).await.unwrap();
    Mydb{
        db:db
    }.init_app_state();
 
      
   
 let app=Router::new().route("/generateQuiz",post(quiz));
 let listen=tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
 axum::serve(listen,app).await.unwrap();   
}
#[stateful]
async fn quiz(x:AppState<Mydb>,Json(v):Json<Request>)->impl IntoResponse
{
   let QUIZ_DESCRIPTION = v.Description;
let TOTAL_QUESTIONS = v.Total_Questions;
let ANYTHING_ELSE = v.Anything_Else;
let QUESTION_TYPES =v.QUESTION_TYPES;
let DIFFICULTY = v.difficulty;
let Sets=v.sets;


let prompt = format!(
   "You are a quiz generator. Create quiz questions based on the following user input:

Quiz Description: {QUIZ_DESCRIPTION}
Number of Questions: {TOTAL_QUESTIONS}
Anything Else Selected: {ANYTHING_ELSE}
Chosen Question Types: {QUESTION_TYPES}
Difficulty Distribution: {DIFFICULTY}
Number of sets:{Sets}
### IMPORTANT RULES (STRICTLY FOLLOW)
If Anything Else Selected = No:
  - Generate only MCQs with a single correct answer.
  - Use this difficulty distribution: 40% Easy, 40% Medium, 20% Hard.
  - Ignore {QUESTION_TYPES} and {DIFFICULTY}.

If Anything Else Selected = Yes:
  - Use the question types specified in {QUESTION_TYPES}.
  - Respect the difficulty distribution from {DIFFICULTY}.
  - Generate as many quiz sets as requested in {Sets}.
3. For each question, always provide:
   - Question text
   - Options (only if MCQ)
   - Correct answer
   - Short explanation
   - Difficulty level
   - Question type

Output JSON format must strictly be:
{{
  set:[
  \"questions\": [
    {{
      \"question\": \"...\",
      \"options\": [\"...\",\"...\"],
      \"correct_answer\": \"...\",
      \"explanation\": \"...\",
      \"difficulty\": \"...\",
      \"question_type\": \"...\"
    }}
  ]
]
}}"
);


    let body=json!({
        "contents": [
            {
                "parts": [
                    { "text":prompt}
                ]
            }
        ]
    });
    let res=Client::new()
    .post(env::var("api").unwrap())
    .header("Content-Type","application/json")
    .header("x-goog-api-key",env::var("apikey").unwrap())
    .json(&body)
    .send()
    .await.unwrap().json::<serde_json::Value>().await.unwrap();
   let text = res["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .unwrap();

    // Some Gemini responses may include ```json ... ``` fences → strip them
    let cleaned = text
        .trim()
        .trim_start_matches("```json")
        .trim_start_matches("```")
        .trim_end_matches("```")
        .trim();

    // Deserialize into your Quiz struct
    let quizdata: Result<Quiz,serde_json::Error> = serde_json::from_str(cleaned);
     match quizdata{
        Ok(Quiz)=>{
            println!("it a success");
            let mut count=1;
            let id=Uuid::new_v4().to_string();
            for set in &Quiz.set
            {
                for q in &set.questions
                {
                    let res:Option<Questiondoc>=x.db.create("Question").content(Questiondoc{
                        qid:id.clone(),
                        set:count,
                        question:q.question.clone(),
                        options:q.options.clone(),
                        Ans:q.correct_answer.clone(),
                        explanation:q.explanation.clone(),
                        difficulty:q.difficulty.clone(),
                        question_type:q.question_type.clone()
                    }).await.unwrap();
                }
                count=count+1;
                
            }
            let res:Option<check>=x.db.create("Sairam").content(check{
                why:"why not".to_string()
            }).await.unwrap();

            (StatusCode::OK,Json(Quiz))
        }
        Err(e)=>{
            println!("sai ram");
            (StatusCode::INTERNAL_SERVER_ERROR,Json(Quiz{set:Vec::new()}))
            
        }
     }

    
     
            
}
//rendu database->user lo kuiz add cheyala
//quiz,quiz author,particpant
//scheduling