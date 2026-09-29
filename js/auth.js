const SUPABASE_URL="https://qvxoxrzvxyyribqjnpkb.supabase.co";
const SUPABASE_KEY="sb_publishable_1zOA0YpTtJkNYsmm4zXxsA_wSJpdHKe";
const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const form=document.getElementById("authForm"),message=document.getElementById("message");
const emailInput=document.getElementById("email"),passwordInput=document.getElementById("password");
const loginRedirect=new URL("./login.html",window.location.href).href;

function showMessage(text,kind=""){message.textContent=text;message.className="form-message"+(kind?" "+kind:"")}

async function go(){
  const {data:{session}}=await supabaseClient.auth.getSession();
  if(session) location.href="app.html";
}
go();

form?.addEventListener("submit",async e=>{
  e.preventDefault();
  const email=emailInput.value.trim();
  const password=passwordInput.value;
  showMessage("ログインしています…");
  const {error}=await supabaseClient.auth.signInWithPassword({email,password});
  if(error){
    if(/confirm|verify|not confirmed/i.test(error.message)){
      showMessage("メールアドレスの確認が完了していません。確認メールを確認してください。","error");
    }else{
      showMessage("ログインに失敗しました。メールアドレスとパスワードを確認してください。","error");
    }
    return;
  }
  location.href="app.html";
});

document.getElementById("signupButton")?.addEventListener("click",async()=>{
  const email=emailInput.value.trim();
  const password=passwordInput.value;
  if(!email){showMessage("メールアドレスを入力してください。","error");emailInput.focus();return}
  if(password.length<6){showMessage("パスワードは6文字以上にしてください。","error");passwordInput.focus();return}

  showMessage("アカウントを作成しています…");
  const {data,error}=await supabaseClient.auth.signUp({
    email,
    password,
    options:{emailRedirectTo:loginRedirect}
  });

  if(error){
    console.error("VocalinkFind signup error:",error);
    if(/rate limit|too many requests/i.test(error.message)){
      showMessage("確認メールの送信回数が上限に達しています。しばらく時間をおいてから再試行してください。","error");
    }else if(/already registered|already exists/i.test(error.message)){
      showMessage("このメールアドレスはすでに登録されています。ログインを試してください。","error");
    }else{
      showMessage("アカウント作成に失敗しました。時間をおいてもう一度お試しください。","error");
    }
    return;
  }

  if(data.session){
    showMessage("アカウントを作成しました。ログイン状態です。","success");
    setTimeout(()=>location.href="app.html",700);
    return;
  }

  showMessage("確認メールを送信しました。届かない場合は、迷惑メールフォルダとメールアドレスを確認してください。","success");
});
