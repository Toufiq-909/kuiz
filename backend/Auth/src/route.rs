use axum::{
    Router,
    routing::*
};
use crate::handler;
use surrealdb::engine::any::Any;
use surrealdb::Surreal;
use std::sync::Arc;
use tower_http::cors::{CorsLayer,Any as we};
pub fn app(db:Arc<Surreal<Any>>)->Router
{
    let cors=CorsLayer::new().allow_origin(we).allow_headers(we);
    Router::new().route("/check",post(handler::check))
    .route("/otp",post(handler::Otps))
    .route("/verify",post(handler::Verify))
    .route("/updateotp",post(handler::Updateotp))
    .route("/signin",post(handler::Signin))
    .with_state(db.clone())
    .route("/verifyjwt",get(handler::Verifyjwt))
    .layer(cors)
}