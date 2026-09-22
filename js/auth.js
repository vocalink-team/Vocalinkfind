const SUPABASE_URL="https://qvxoxrzvxyyribqjnpkb.supabase.co";
const SUPABASE_KEY="sb_publishable_1zOA0YpTtJkNYsmm4zXxsA_wSJpdHKe";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const form=document.getElementById("authForm"),message=document.getElementById("message");
async function go(){const {data:{session}}=await supabaseClient.auth.getSession();if(session) location.href="app.html";}
go();
form?.addEventListener("submit",async e=>{e.preventDefault();message.textContent="ログインしています…";const {error}=await supabaseClient.auth.signInWithPassword({email:email.value.trim(),password:password.value});if(error){message.textContent=error.message;return}location.href="app.html"});
document.getElementById("signupButton")?.addEventListener("click",async()=>{message.textContent="アカウントを作成しています…";const {data,error}=await supabaseClient.auth.signUp({email:email.value.trim(),password:password.value});if(error){message.textContent=error.message;return}message.textContent=data.session?"登録しました。":"確認メールを確認してください。"});
