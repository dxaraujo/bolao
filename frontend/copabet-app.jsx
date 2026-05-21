import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

/* ─── GLOBAL CSS ─────────────────────────────────────────────────────────── */
const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
input[type=number]{-moz-appearance:textfield}
::-webkit-scrollbar{width:3px;background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px}
@keyframes fadeUp {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn {from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
@keyframes ping   {0%{transform:scale(1);opacity:.8}75%,100%{transform:scale(2);opacity:0}}
@keyframes pulse  {0%,100%{opacity:1}50%{opacity:.3}}
@keyframes pop    {0%{transform:scale(.94);opacity:0}100%{transform:scale(1);opacity:1}}
@keyframes spin   {to{transform:rotate(360deg)}}
.anim-fade{animation:fadeIn .35s ease both}
.anim-up  {animation:fadeUp .4s ease both}
.anim-pop {animation:pop   .35s ease both}
`;

/* ─── THEMES ─────────────────────────────────────────────────────────────── */
const DARK = {
  bg:"#070d18", bg2:"#0d1526", bg3:"#101c30",
  surface:"#111d2e", surf2:"#172438", surf3:"#1c2c42",
  border:"#1e2f45", borderB:"#253a58",
  text:"#f0f6ff", sub:"#64849f", muted:"#243347", mutedT:"#3a5270",
  acc:"#00e5ff", accDim:"rgba(0,229,255,.1)", accDim2:"rgba(0,229,255,.06)",
  gold:"#f59e0b", goldDim:"rgba(245,158,11,.1)",
  green:"#22c55e", greenDim:"rgba(34,197,94,.1)",
  red:"#ef4444", redDim:"rgba(239,68,68,.1)",
  purple:"#a78bfa",
  navBg:"rgba(7,13,24,.94)",
  isDark:true,
};
const LIGHT = {
  bg:"#eef3f9", bg2:"#e4ecf5", bg3:"#dce6f2",
  surface:"#ffffff", surf2:"#f4f8fd", surf3:"#eaf1fa",
  border:"#cad8ec", borderB:"#b8ccdf",
  text:"#0a1524", sub:"#4d6a85", muted:"#d0dcea", mutedT:"#8fa8c0",
  acc:"#0077b6", accDim:"rgba(0,119,182,.08)", accDim2:"rgba(0,119,182,.04)",
  gold:"#c27800", goldDim:"rgba(194,120,0,.08)",
  green:"#16a34a", greenDim:"rgba(22,163,74,.08)",
  red:"#dc2626", redDim:"rgba(220,38,38,.08)",
  purple:"#7c3aed",
  navBg:"rgba(238,243,249,.96)",
  isDark:false,
};

/* ─── MOCK DATA  (mirrors API responses) ─────────────────────────────────── */
// GET /api/stage/visible
const STAGES = [
  {id:1,name:"Fase de Grupos",  short:"Grupos",  status:"BLOCKED",  deadline:"2026-06-25T23:59:00"},
  {id:2,name:"Oitavas de Final",short:"Oitavas", status:"BLOCKED",  deadline:"2026-06-29T23:59:00"},
  {id:3,name:"Quartas de Final",short:"Quartas", status:"OPEN",     deadline:"2026-07-04T15:59:00"},
  {id:4,name:"Semifinal",       short:"Semi",    status:"DISABLED", deadline:null},
  {id:5,name:"Final",           short:"Final",   status:"DISABLED", deadline:null},
];

// GET /api/match/visible
const ALL_MATCHES = [
  {id:1, stageId:3,home:"Brasil",   hf:"🇧🇷",away:"Argentina",af:"🇦🇷",date:"2026-07-04",time:"16:00",status:"upcoming",hs:null,as:null},
  {id:2, stageId:3,home:"França",   hf:"🇫🇷",away:"Alemanha", af:"🇩🇪",date:"2026-07-04",time:"20:00",status:"upcoming",hs:null,as:null},
  {id:3, stageId:3,home:"Portugal", hf:"🇵🇹",away:"Espanha",  af:"🇪🇸",date:"2026-07-05",time:"16:00",status:"live",    hs:1, as:0},
  {id:4, stageId:3,home:"Marrocos", hf:"🇲🇦",away:"Japão",    af:"🇯🇵",date:"2026-07-05",time:"20:00",status:"finished",hs:2, as:1},
  {id:5, stageId:2,home:"Brasil",   hf:"🇧🇷",away:"Nigéria",  af:"🇳🇬",date:"2026-06-28",time:"20:00",status:"finished",hs:3, as:0},
  {id:6, stageId:2,home:"Argentina",hf:"🇦🇷",away:"Chile",    af:"🇨🇱",date:"2026-06-29",time:"16:00",status:"finished",hs:2, as:2},
  {id:7, stageId:2,home:"França",   hf:"🇫🇷",away:"Bélgica",  af:"🇧🇪",date:"2026-06-29",time:"20:00",status:"finished",hs:1, as:0},
  {id:8, stageId:2,home:"Portugal", hf:"🇵🇹",away:"EUA",       af:"🇺🇸",date:"2026-06-30",time:"20:00",status:"finished",hs:3, as:1},
  {id:9, stageId:1,home:"Brasil",   hf:"🇧🇷",away:"Sérvia",   af:"🇷🇸",date:"2026-06-14",time:"16:00",status:"finished",hs:2, as:0},
  {id:10,stageId:1,home:"Alemanha", hf:"🇩🇪",away:"Japão",    af:"🇯🇵",date:"2026-06-14",time:"20:00",status:"finished",hs:1, as:2},
  {id:11,stageId:1,home:"Espanha",  hf:"🇪🇸",away:"Costa Rica",af:"🇨🇷",date:"2026-06-15",time:"16:00",status:"finished",hs:7, as:0},
  {id:12,stageId:1,home:"Argentina",hf:"🇦🇷",away:"Arábia Saudita",af:"🇸🇦",date:"2026-06-15",time:"20:00",status:"finished",hs:1,as:2},
];

// GET /api/user/active — ordered by points
const USERS = [
  {id:1,name:"Lucas",   avatar:"L",flag:"🇧🇷",pts:47,exact:4,correct:9, wrong:3},
  {id:2,name:"Mariana", avatar:"M",flag:"🇦🇷",pts:38,exact:3,correct:7, wrong:6},
  {id:3,name:"Pedro",   avatar:"P",flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",pts:32,exact:2,correct:8, wrong:6},
  {id:4,name:"Ana",     avatar:"A",flag:"🇫🇷",pts:29,exact:3,correct:5, wrong:8},
  {id:5,name:"Rafael",  avatar:"R",flag:"🇩🇪",pts:24,exact:1,correct:7, wrong:8},
  {id:6,name:"Juliana", avatar:"J",flag:"🇵🇹",pts:18,exact:1,correct:4, wrong:11},
];

// GET /api/user/authenticated
const ME = USERS[0];

// GET /api/bet
const MY_BETS_INIT = {1:{h:"",a:""},2:{h:"",a:""},3:{h:"",a:""},4:{h:"",a:""}};

// GET /api/config
const CONFIG = {pointsExact:5, pointsResult:2, pointsWrong:0};

// GET /api/bet — all users' bets for every finished match
// structure: matchId → userId → { h, a }
const ALL_USER_BETS = {
  // Oitavas ─ match 5: Brasil 3×0 Nigéria
  5:{ 1:{h:3,a:0}, 2:{h:2,a:0}, 3:{h:2,a:1}, 4:{h:1,a:0}, 5:{h:0,a:1}, 6:{h:1,a:1} },
  // Oitavas ─ match 6: Argentina 2×2 Chile
  6:{ 1:{h:2,a:2}, 2:{h:1,a:1}, 3:{h:3,a:1}, 4:{h:0,a:0}, 5:{h:2,a:1}, 6:{h:1,a:2} },
  // Oitavas ─ match 7: França 1×0 Bélgica
  7:{ 1:{h:2,a:0}, 2:{h:1,a:0}, 3:{h:1,a:1}, 4:{h:2,a:1}, 5:{h:0,a:2}, 6:{h:1,a:0} },
  // Oitavas ─ match 8: Portugal 3×1 EUA
  8:{ 1:{h:3,a:1}, 2:{h:2,a:0}, 3:{h:2,a:1}, 4:{h:0,a:0}, 5:{h:2,a:2}, 6:{h:1,a:0} },
  // Grupos ─ match 9: Brasil 2×0 Sérvia
  9:{ 1:{h:2,a:0}, 2:{h:3,a:1}, 3:{h:1,a:0}, 4:{h:2,a:1}, 5:{h:1,a:1}, 6:{h:0,a:1} },
  // Grupos ─ match 10: Alemanha 1×2 Japão
  10:{ 1:{h:1,a:2}, 2:{h:2,a:0}, 3:{h:0,a:1}, 4:{h:1,a:1}, 5:{h:1,a:2}, 6:{h:3,a:0} },
  // Grupos ─ match 11: Espanha 7×0 Costa Rica
  11:{ 1:{h:4,a:0}, 2:{h:3,a:0}, 3:{h:5,a:1}, 4:{h:2,a:0}, 5:{h:3,a:1}, 6:{h:1,a:0} },
  // Grupos ─ match 12: Argentina 1×2 Arábia Saudita
  12:{ 1:{h:2,a:1}, 2:{h:3,a:0}, 3:{h:1,a:2}, 4:{h:2,a:0}, 5:{h:0,a:1}, 6:{h:1,a:2} },
};

// Computes how a single bet fared against the actual score
function betResult(bet, match){
  if(!bet||match.hs===null) return "pending";
  if(bet.h===match.hs && bet.a===match.as) return "exact";
  const actualDir = match.hs>match.as?"H":match.hs<match.as?"A":"D";
  const betDir    = bet.h >bet.a  ?"H":bet.h <bet.a  ?"A":"D";
  return actualDir===betDir ? "correct" : "wrong";
}
function resultPts(r){ return r==="exact"?CONFIG.pointsExact:r==="correct"?CONFIG.pointsResult:0; }
function resultLabel(r){ return r==="exact"?"🎯 Exato":r==="correct"?"✓ Certo":"✗ Errou"; }

/* ─── SHARED COMPONENTS ──────────────────────────────────────────────────── */
function Avatar({user,size=38,t}){
  return(
    <div style={{width:size,height:size,borderRadius:"50%",flexShrink:0,
      background:`linear-gradient(135deg,${t.acc},${t.gold})`,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:"'Bebas Neue',cursive",fontSize:size*.42,color:t.isDark?"#070d18":"#fff",
      border:`2px solid ${t.border}`}}>
      {user.avatar}
    </div>
  );
}

function LiveDot(){
  return(
    <span style={{position:"relative",display:"inline-flex",width:8,height:8}}>
      <span style={{position:"absolute",inset:0,borderRadius:"50%",background:"#ef4444",opacity:.7,animation:"ping 1.4s ease infinite"}}/>
      <span style={{width:8,height:8,borderRadius:"50%",background:"#ef4444",display:"inline-block"}}/>
    </span>
  );
}

function StageBadge({status,t}){
  const map={
    OPEN:  {color:t.green, dim:t.greenDim, label:"Aberto"},
    BLOCKED:{color:t.sub,  dim:t.muted,    label:"Encerrado"},
    DISABLED:{color:t.mutedT,dim:t.muted,  label:"Em Breve"},
  };
  const s=map[status]||map.DISABLED;
  return(
    <span style={{fontSize:9,fontWeight:700,letterSpacing:.8,color:s.color,
      background:s.dim,padding:"2px 7px",borderRadius:6,textTransform:"uppercase",border:`1px solid ${s.color}33`}}>
      {s.label}
    </span>
  );
}

function Header({t,onToggleTheme,screen}){
  return(
    <div style={{padding:"16px 18px 14px",
      background:`linear-gradient(180deg,${t.bg2} 0%,${t.bg} 100%)`,
      borderBottom:`1px solid ${t.border}`,position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,lineHeight:1,color:t.text,letterSpacing:1}}>
          COPA<span style={{color:t.acc}}>BET</span>
          <span style={{fontSize:13,fontWeight:400,fontFamily:"'Outfit',sans-serif",
            color:t.sub,marginLeft:8,letterSpacing:0}}>2026</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={onToggleTheme} style={{
            width:32,height:32,borderRadius:10,border:`1px solid ${t.border}`,
            background:t.surface,cursor:"pointer",fontSize:15,display:"flex",
            alignItems:"center",justifyContent:"center"}}>
            {t.isDark?"☀️":"🌙"}
          </button>
          <Avatar user={ME} size={32} t={t}/>
        </div>
      </div>
    </div>
  );
}

function BottomNav({active,onNav,t}){
  const tabs=[
    {id:"home",  icon:"⚽",label:"Jogos"},
    {id:"rank",  icon:"🏆",label:"Ranking"},
    {id:"bets",  icon:"🎯",label:"Apostas"},
    {id:"bolao", icon:"👥",label:"Bolão"},
    {id:"stats", icon:"📊",label:"Stats"},
  ];
  return(
    <div style={{position:"sticky",bottom:0,zIndex:50,
      background:t.navBg,backdropFilter:"blur(18px)",
      borderTop:`1px solid ${t.border}`,display:"flex"}}>
      {tabs.map(tab=>{
        const a=active===tab.id;
        return(
          <button key={tab.id} onClick={()=>onNav(tab.id)} style={{
            flex:1,padding:"8px 0 10px",textAlign:"center",background:"none",
            border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
            <div style={{fontSize:17}}>{tab.icon}</div>
            <div style={{fontSize:9,marginTop:2,fontWeight:a?700:500,
              color:a?t.acc:t.sub}}>{tab.label}</div>
            {a&&<div style={{width:16,height:2,background:t.acc,borderRadius:2,margin:"3px auto 0"}}/>}
          </button>
        );
      })}
    </div>
  );
}

/* ─── SCREEN 1: LOGIN ────────────────────────────────────────────────────── */
function LoginScreen({onLogin,t}){
  const [loading,setLoading]=useState(false);
  function handle(){
    setLoading(true);
    setTimeout(()=>onLogin(),1600);
  }
  return(
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:32,
      fontFamily:"'Outfit',sans-serif",position:"relative",overflow:"hidden"}}>

      {/* background rings */}
      {[300,220,140].map((s,i)=>(
        <div key={i} style={{position:"absolute",width:s,height:s,borderRadius:"50%",
          border:`1px solid ${t.acc}${["0a","07","05"][i]}`,
          top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
      ))}

      <div className="anim-fade" style={{textAlign:"center",zIndex:1}}>
        {/* Logo */}
        <div style={{marginBottom:32}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:56,lineHeight:1,
            color:t.text,letterSpacing:3}}>
            COPA<span style={{color:t.acc}}>BET</span>
          </div>
          <div style={{fontSize:13,color:t.sub,marginTop:4,letterSpacing:2,textTransform:"uppercase"}}>
            Bolão · Copa do Mundo 2026
          </div>
        </div>

        {/* Card */}
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:20,
          padding:"28px 28px 24px",marginBottom:32,textAlign:"left"}}>
          <div style={{fontSize:15,fontWeight:700,color:t.text,marginBottom:6}}>
            Dispute com seus amigos
          </div>
          <div style={{fontSize:13,color:t.sub,lineHeight:1.6,marginBottom:18}}>
            Aposte nos placares de cada jogo e suba no ranking do grupo fase a fase.
          </div>
          {[
            {icon:"⚽",text:`+${CONFIG.pointsExact} pontos por placar exato`},
            {icon:"✅",text:`+${CONFIG.pointsResult} pontos pelo resultado correto`},
            {icon:"📅",text:"Apostas por fase com prazo definido"},
          ].map(({icon,text})=>(
            <div key={text} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <span style={{fontSize:16}}>{icon}</span>
              <span style={{fontSize:12,color:t.sub}}>{text}</span>
            </div>
          ))}
        </div>

        {/* Google button */}
        <button onClick={handle} disabled={loading} style={{
          width:"100%",height:50,borderRadius:14,border:`1px solid ${t.border}`,
          background:t.surface,cursor:loading?"not-allowed":"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:12,
          fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:600,color:t.text,
          transition:"opacity .2s",opacity:loading?.7:1}}>
          {loading
            ? <><span style={{width:18,height:18,borderRadius:"50%",
                border:`2px solid ${t.border}`,borderTopColor:t.acc,
                animation:"spin .8s linear infinite",display:"inline-block"}}/>
                Entrando…</>
            : <><svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar com Google</>
          }
        </button>
        <div style={{fontSize:11,color:t.mutedT,marginTop:14}}>
          Apenas membros do grupo têm acesso
        </div>
      </div>
    </div>
  );
}

/* ─── SCREEN 2: HOME / JOGOS ─────────────────────────────────────────────── */
function HomeScreen({t,onNav}){
  const todayMatches=ALL_MATCHES.filter(m=>m.stageId===3);
  const pastMatches=ALL_MATCHES.filter(m=>m.stageId===2).slice(0,2);

  function MatchCard({m,i}){
    const isLive=m.status==="live";
    const done=m.status==="finished";
    return(
      <div className="anim-up" style={{animationDelay:`${i*60}ms`,
        background:t.surface,border:`1px solid ${isLive?t.red+"55":t.border}`,
        borderRadius:16,padding:"14px 16px",marginBottom:10,position:"relative",overflow:"hidden"}}>
        {isLive&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,${t.red},transparent)`}}/>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:10,color:t.sub,fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>
            {STAGES.find(s=>s.id===m.stageId)?.short}
          </span>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {isLive&&<LiveDot/>}
            <span style={{fontSize:10,fontWeight:700,
              color:isLive?t.red:done?t.sub:t.acc}}>
              {isLive?"AO VIVO":done?"Encerrado":`${m.date.slice(8)}/07 · ${m.time}`}
            </span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:26}}>{m.hf}</div>
            <div style={{fontSize:11,fontWeight:700,color:t.text,marginTop:3}}>{m.home}</div>
          </div>
          <div style={{textAlign:"center",minWidth:56}}>
            {(isLive||done)
              ? <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,
                  color:t.text,letterSpacing:3,lineHeight:1}}>{m.hs}&nbsp;–&nbsp;{m.as}</div>
              : <div style={{fontSize:13,color:t.muted,fontWeight:700,letterSpacing:2}}>VS</div>}
            {!done&&!isLive&&<div style={{fontSize:9,color:t.mutedT,marginTop:3}}>{m.time}</div>}
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:26}}>{m.af}</div>
            <div style={{fontSize:11,fontWeight:700,color:t.text,marginTop:3}}>{m.away}</div>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{flex:1,overflowY:"auto",padding:"16px 18px 0",fontFamily:"'Outfit',sans-serif"}}>
      {/* Hero card */}
      <div className="anim-up" style={{borderRadius:18,padding:"18px 18px 16px",marginBottom:20,
        background:`linear-gradient(135deg,${t.acc}18,${t.gold}12)`,
        border:`1px solid ${t.acc}28`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",right:-24,top:-24,width:120,height:120,
          borderRadius:"50%",background:t.acc,opacity:.05}}/>
        <div style={{fontSize:11,fontWeight:700,color:t.acc,letterSpacing:1,
          textTransform:"uppercase",marginBottom:8}}>Sua Posição Atual</div>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:10}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:48,lineHeight:1,color:t.text}}>
            🥇 1°
          </div>
          <div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:32,color:t.acc,lineHeight:1}}>
              {ME.pts} <span style={{fontSize:16,color:t.sub}}>pts</span>
            </div>
            <div style={{fontSize:11,color:t.sub}}>de {USERS.length} participantes</div>
          </div>
        </div>
        <div style={{display:"flex",gap:16}}>
          {[[ME.exact,"placar exato"],[ME.correct,"resultados"],[ME.wrong,"erros"]].map(([v,l])=>(
            <div key={l}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:t.text,lineHeight:1}}>{v}</div>
              <div style={{fontSize:9,color:t.sub,textTransform:"uppercase",letterSpacing:.4}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Open stage alert */}
      <div className="anim-up" style={{animationDelay:"60ms",borderRadius:12,padding:"10px 14px",
        marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",
        background:t.greenDim,border:`1px solid ${t.green}33`,cursor:"pointer"}}
        onClick={()=>onNav("bets")}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:t.green}}>📋 Apostas das Quartas abertas</div>
          <div style={{fontSize:10,color:t.sub,marginTop:1}}>Prazo: 04/07 às 15h59 · 4 jogos</div>
        </div>
        <div style={{fontSize:18,color:t.green}}>›</div>
      </div>

      {/* Today */}
      <div style={{fontSize:12,fontWeight:700,color:t.sub,letterSpacing:1,
        textTransform:"uppercase",marginBottom:10}}>Quartas de Final</div>
      {todayMatches.map((m,i)=><MatchCard key={m.id} m={m} i={i}/>)}

      {/* Recent */}
      <div style={{fontSize:12,fontWeight:700,color:t.sub,letterSpacing:1,
        textTransform:"uppercase",margin:"18px 0 10px"}}>Resultados Recentes</div>
      {pastMatches.map((m,i)=><MatchCard key={m.id} m={m} i={i}/>)}
      <div style={{height:8}}/>
    </div>
  );
}

/* ─── SCREEN 3: APOSTAS ──────────────────────────────────────────────────── */
function BetsScreen({t}){
  const [stageIdx,setStageIdx]=useState(2); // quartas = OPEN
  const [bets,setBets]=useState(MY_BETS_INIT);
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);

  const stage=STAGES[stageIdx];
  const isOpen=stage.status==="OPEN";
  const isBlocked=stage.status==="BLOCKED";
  const stageMatches=ALL_MATCHES.filter(m=>m.stageId===stage.id);
  const filled=isOpen?Object.values(bets).filter(b=>b.h!==""&&b.a!=="").length:0;

  function saveAll(){
    if(filled===0)return;
    setSaving(true);
    setTimeout(()=>{setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2500);},900);
  }

  // simulate blocked-stage bets (past)
  const PAST_BETS={
    5:{h:3,a:0,result:"exact"},
    6:{h:2,a:1,result:"correct"},
    7:{h:1,a:0,result:"exact"},
    8:{h:2,a:0,result:"wrong"},
  };

  function BetCard({m,i}){
    const bet=isOpen?bets[m.id]:PAST_BETS[m.id];
    const filled=isOpen&&bet&&bet.h!==""&&bet.a!=="";
    const done=m.status==="finished";

    const resultColor=!isBlocked?null:
      bet?.result==="exact"?t.green:bet?.result==="correct"?t.gold:t.red;

    return(
      <div className="anim-up" style={{animationDelay:`${i*55}ms`,
        borderRadius:16,padding:"14px 16px",marginBottom:10,
        background:t.surface,
        border:`1px solid ${filled?t.acc+"44":resultColor?resultColor+"33":t.border}`,
        position:"relative",overflow:"hidden",transition:"border-color .2s"}}>
        {filled&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,
          background:t.acc,borderRadius:"3px 0 0 3px"}}/>}
        {resultColor&&isBlocked&&<div style={{position:"absolute",left:0,top:0,bottom:0,
          width:3,background:resultColor,borderRadius:"3px 0 0 3px"}}/>}

        {/* Match header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:10,color:t.sub,fontWeight:600}}>
            Jogo {i+1} · {m.date.slice(8)}/{m.date.slice(5,7)} · {m.time}
          </span>
          {isBlocked&&bet?.result&&(
            <span style={{fontSize:9,fontWeight:700,
              color:resultColor,background:`${resultColor}15`,
              padding:"2px 7px",borderRadius:6,border:`1px solid ${resultColor}33`}}>
              {bet.result==="exact"?"🎯 Exato +5pts":bet.result==="correct"?"✓ Resultado +2pts":"✗ Errou +0pts"}
            </span>
          )}
        </div>

        {/* Teams + Inputs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:8,alignItems:"center"}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:3}}>{m.hf}</div>
            <div style={{fontSize:12,fontWeight:700,color:t.text}}>{m.home}</div>
          </div>

          <div style={{textAlign:"center"}}>
            {/* Actual score if finished */}
            {done&&isBlocked&&(
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:t.sub,
                letterSpacing:2,marginBottom:4}}>{m.hs}–{m.as}</div>
            )}
            {/* Bet inputs */}
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <input
                disabled={!isOpen}
                value={isOpen?(bets[m.id]?.h??""):(bet?.h??"")}
                onChange={e=>isOpen&&setBets(b=>({...b,[m.id]:{...b[m.id],h:e.target.value}}))}
                type="number" min={0} max={20} maxLength={2}
                style={{
                  width:36,height:38,borderRadius:9,textAlign:"center",
                  background:isOpen?t.surf2:t.muted+"22",
                  border:`1.5px solid ${(isOpen&&bets[m.id]?.h!=="")?t.acc:resultColor?resultColor+"55":t.border}`,
                  color:isOpen?t.text:resultColor||t.sub,
                  fontFamily:"'Bebas Neue',cursive",fontSize:22,outline:"none",
                  cursor:isOpen?"text":"default",transition:"border-color .2s",
                }}
              />
              <span style={{color:t.sub,fontSize:13,fontWeight:700}}>×</span>
              <input
                disabled={!isOpen}
                value={isOpen?(bets[m.id]?.a??""):(bet?.a??"")}
                onChange={e=>isOpen&&setBets(b=>({...b,[m.id]:{...b[m.id],a:e.target.value}}))}
                type="number" min={0} max={20} maxLength={2}
                style={{
                  width:36,height:38,borderRadius:9,textAlign:"center",
                  background:isOpen?t.surf2:t.muted+"22",
                  border:`1.5px solid ${(isOpen&&bets[m.id]?.a!=="")?t.acc:resultColor?resultColor+"55":t.border}`,
                  color:isOpen?t.text:resultColor||t.sub,
                  fontFamily:"'Bebas Neue',cursive",fontSize:22,outline:"none",
                  cursor:isOpen?"text":"default",transition:"border-color .2s",
                }}
              />
            </div>
            <div style={{fontSize:9,color:t.mutedT,marginTop:3}}>palpite</div>
          </div>

          <div style={{textAlign:"center"}}>
            <div style={{fontSize:28,marginBottom:3}}>{m.af}</div>
            <div style={{fontSize:12,fontWeight:700,color:t.text}}>{m.away}</div>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",
      fontFamily:"'Outfit',sans-serif"}}>

      {/* Stage tabs */}
      <div style={{padding:"12px 18px 0",
        background:`linear-gradient(180deg,${t.bg2} 0%,${t.bg} 100%)`,
        borderBottom:`1px solid ${t.border}`}}>
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:12}}>
          {STAGES.map((s,i)=>{
            const active=stageIdx===i;
            const can=s.status!=="DISABLED";
            const col=s.status==="OPEN"?t.green:s.status==="BLOCKED"?t.sub:t.mutedT;
            return(
              <button key={s.id} onClick={()=>can&&setStageIdx(i)}
                style={{
                  flexShrink:0,border:`1.5px solid ${active?t.acc:col+"44"}`,
                  borderRadius:10,padding:"6px 13px",cursor:can?"pointer":"default",
                  background:active?t.acc+(!t.isDark?"22":"1a"):"transparent",
                  fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:12,
                  color:active?t.acc:(can?col:t.mutedT),
                  transition:"all .18s",position:"relative",
                }}>
                {s.short}
                {s.status==="OPEN"&&!active&&(
                  <span style={{position:"absolute",top:3,right:3,width:5,height:5,
                    borderRadius:"50%",background:t.green}}/>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Status banner */}
      <div style={{padding:"10px 18px 0"}}>
        <div style={{borderRadius:12,padding:"10px 14px",marginBottom:12,
          background:isOpen?t.greenDim:isBlocked?t.muted+"18":t.muted+"10",
          border:`1px solid ${isOpen?t.green+"44":isBlocked?t.border:t.muted+"22"}`,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,fontWeight:700,
              color:isOpen?t.green:isBlocked?t.sub:t.mutedT}}>
              {isOpen?"✏️  Apostas abertas — edite até 04/07 às 15h59"
                :isBlocked?"🔒 Fase encerrada — palpites bloqueados"
                :"⏳ Fase não disponível ainda"}
            </div>
            <div style={{fontSize:10,color:t.sub,marginTop:1}}>
              {isOpen?`+${CONFIG.pointsExact}pts placar exato · +${CONFIG.pointsResult}pts resultado · +${CONFIG.pointsWrong}pts erro`
                :isBlocked?"Veja seus resultados abaixo"
                :"Aguarde a liberação desta fase"}
            </div>
          </div>
          <StageBadge status={stage.status} t={t}/>
        </div>

        {/* Disabled message */}
        {stage.status==="DISABLED"&&(
          <div style={{borderRadius:14,padding:"28px 20px",textAlign:"center",
            background:t.surface,border:`1px solid ${t.border}`,marginBottom:12}}>
            <div style={{fontSize:32,marginBottom:10}}>🔜</div>
            <div style={{fontSize:15,fontWeight:700,color:t.text,marginBottom:4}}>
              {stage.name}
            </div>
            <div style={{fontSize:12,color:t.sub}}>
              Esta fase será liberada após a conclusão da fase anterior.
            </div>
          </div>
        )}
      </div>

      {/* Match cards */}
      {stage.status!=="DISABLED"&&(
        <div style={{padding:"0 18px",flex:1}}>
          {stageMatches.map((m,i)=><BetCard key={m.id} m={m} i={i}/>)}
          <div style={{height:8}}/>
        </div>
      )}

      {/* Save button */}
      {isOpen&&(
        <div style={{padding:"10px 18px 14px",borderTop:`1px solid ${t.border}`,
          background:t.navBg,backdropFilter:"blur(12px)"}}>
          {/* Progress bar */}
          <div style={{display:"flex",justifyContent:"space-between",
            alignItems:"center",marginBottom:8}}>
            <span style={{fontSize:11,color:t.sub,fontWeight:600}}>
              Palpites preenchidos
            </span>
            <span style={{fontSize:11,fontWeight:700,
              color:filled===stageMatches.length?t.green:t.sub}}>
              {filled}/{stageMatches.length}
            </span>
          </div>
          <div style={{height:4,borderRadius:4,background:t.muted,overflow:"hidden",marginBottom:12}}>
            <div style={{height:"100%",borderRadius:4,
              background:`linear-gradient(90deg,${t.acc},${t.green})`,
              width:`${(filled/stageMatches.length)*100}%`,transition:"width .3s ease"}}/>
          </div>
          <button onClick={saveAll} disabled={filled===0||saving}
            style={{
              width:"100%",height:46,borderRadius:13,border:`1.5px solid ${t.acc}`,
              cursor:filled===0?"not-allowed":"pointer",
              background:saved?t.greenDim:saving?t.accDim2:t.acc,
              color:saved?t.green:saving?t.acc:t.isDark?"#070d18":"#fff",
              fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:1,
              transition:"all .25s",display:"flex",alignItems:"center",
              justifyContent:"center",gap:8,
            }}>
            {saving
              ? <><span style={{width:16,height:16,borderRadius:"50%",
                  border:`2px solid ${t.acc}`,borderTopColor:"transparent",
                  animation:"spin .7s linear infinite"}}/>Salvando…</>
              : saved?"✓ APOSTAS SALVAS!"
              : filled===0?"PREENCHA OS PALPITES"
              : `SALVAR ${filled} PALPITE${filled>1?"S":""}`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── SCREEN 4: RANKING ─────────────────────────────────────────────────── */
function RankingScreen({t}){
  const maxPts=USERS[0].pts;
  const medals=["🥇","🥈","🥉"];

  const chartData=USERS.map(u=>({name:u.name,pts:u.pts,exact:u.exact}));

  const CustomTooltip=({active,payload,label})=>{
    if(!active||!payload?.length)return null;
    return(
      <div style={{background:t.surface,border:`1px solid ${t.border}`,
        borderRadius:10,padding:"8px 12px",fontFamily:"'Outfit',sans-serif"}}>
        <div style={{fontSize:12,fontWeight:700,color:t.text,marginBottom:4}}>{label}</div>
        <div style={{fontSize:11,color:t.acc}}>{payload[0]?.value} pts</div>
        <div style={{fontSize:11,color:t.gold}}>{payload[1]?.value} exatos</div>
      </div>
    );
  };

  return(
    <div style={{flex:1,overflowY:"auto",padding:"16px 18px",fontFamily:"'Outfit',sans-serif"}}>

      {/* Podium */}
      <div className="anim-up" style={{borderRadius:18,overflow:"hidden",
        background:t.surface,border:`1px solid ${t.border}`,marginBottom:16}}>
        <div style={{padding:"14px 16px 0",
          background:`linear-gradient(135deg,${t.acc}12,${t.gold}08)`}}>
          <div style={{fontSize:11,fontWeight:700,color:t.sub,letterSpacing:1,
            textTransform:"uppercase",marginBottom:14}}>Pódio</div>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:0}}>
            {[USERS[1],USERS[0],USERS[2]].map((u,i)=>{
              const heights=[56,80,44];
              const colors=[t.sub,t.gold,t.acc];
              const labels=["🥈","🥇","🥉"];
              return(
                <div key={u.id} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontSize:14,marginBottom:3}}>{labels[i]}</div>
                  <div style={{width:36,height:36,borderRadius:"50%",margin:"0 auto 4px",
                    background:`linear-gradient(135deg,${colors[i]},${colors[i]}88)`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontFamily:"'Bebas Neue',cursive",fontSize:16,color:"#fff",
                    border:`2px solid ${colors[i]}`}}>
                    {u.avatar}
                  </div>
                  <div style={{fontSize:10,fontWeight:700,color:t.text}}>{u.name}</div>
                  <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:16,
                    color:colors[i],marginBottom:6}}>{u.pts}pts</div>
                  <div style={{height:heights[i],
                    background:`linear-gradient(180deg,${colors[i]}22,${colors[i]}08)`,
                    borderTop:`2px solid ${colors[i]}44`}}/>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full list */}
      <div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:t.sub,letterSpacing:1,
          textTransform:"uppercase",marginBottom:10}}>Classificação Completa</div>
        {USERS.map((u,i)=>{
          const isMe=u.id===ME.id;
          return(
            <div key={u.id} className="anim-up"
              style={{animationDelay:`${i*50}ms`,
                borderRadius:13,padding:"11px 14px",marginBottom:7,
                background:isMe?`linear-gradient(135deg,${t.acc}12,${t.surface})`:t.surface,
                border:`1px solid ${isMe?t.acc+"44":t.border}`,
                display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:26,textAlign:"center",
                fontSize:i<3?17:12,color:i>=3?t.sub:undefined,fontWeight:700}}>
                {i<3?medals[i]:`${i+1}°`}
              </div>
              <Avatar user={u} size={36} t={t}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                  <span style={{fontSize:13,fontWeight:700,color:t.text}}>{u.name}</span>
                  <span style={{fontSize:12}}>{u.flag}</span>
                  {isMe&&<span style={{fontSize:9,fontWeight:700,color:t.acc,
                    background:t.accDim,padding:"1px 5px",borderRadius:4}}>Você</span>}
                </div>
                <div style={{height:5,borderRadius:4,background:t.muted,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:4,
                    background:i===0?t.gold:i===1?t.sub:i===2?t.acc:t.mutedT,
                    width:`${(u.pts/maxPts)*100}%`,transition:"width .8s ease"}}/>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Bebas Neue',cursify",fontSize:22,
                  color:i===0?t.gold:t.text,lineHeight:1}}>{u.pts}</div>
                <div style={{fontSize:9,color:t.sub,textTransform:"uppercase"}}>pts</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar chart */}
      <div className="anim-up" style={{animationDelay:"300ms",borderRadius:16,
        padding:"16px 14px",background:t.surface,border:`1px solid ${t.border}`,marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:t.sub,letterSpacing:1,
          textTransform:"uppercase",marginBottom:14}}>Pontuação e Placares Exatos</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barCategoryGap="28%">
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false}/>
            <XAxis dataKey="name" tick={{fontSize:9,fill:t.sub,fontFamily:"Outfit"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:t.sub,fontFamily:"Outfit"}} axisLine={false} tickLine={false} width={24}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Bar dataKey="pts"   fill={t.acc}  radius={[4,4,0,0]} name="Pontos"/>
            <Bar dataKey="exact" fill={t.gold} radius={[4,4,0,0]} name="Exatos"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scoring legend */}
      <div className="anim-up" style={{animationDelay:"350ms",borderRadius:14,
        padding:"12px 14px",background:t.surface,border:`1px solid ${t.border}`,marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700,color:t.sub,letterSpacing:1,
          textTransform:"uppercase",marginBottom:10}}>Tabela de Pontuação</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[[t.green,"+5","Placar Exato"],[t.gold,"+2","Resultado Certo"],[t.red,"0","Errou"]].map(([c,v,l])=>(
            <div key={l} style={{borderRadius:10,padding:"10px 8px",textAlign:"center",
              background:`${c}12`,border:`1px solid ${c}30`}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,color:c,lineHeight:1}}>{v}</div>
              <div style={{fontSize:9,color:t.sub,marginTop:2,fontWeight:600}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{height:8}}/>
    </div>
  );
}

/* ─── SCREEN 5: STATS ────────────────────────────────────────────────────── */
function StatsScreen({t}){
  const accuracyData=[
    {fase:"Grupos", Lucas:88,Mariana:72,Pedro:65,Ana:70},
    {fase:"Oitavas",Lucas:75,Mariana:60,Pedro:70,Ana:55},
    {fase:"Quartas",Lucas:80,Mariana:65,Pedro:55,Ana:50},
  ];
  const userColors=[t.acc,t.gold,t.purple,t.green];
  const userNames=["Lucas","Mariana","Pedro","Ana"];

  const perUserData=USERS.map(u=>({
    name:u.name,
    pct:Math.round(((u.exact*CONFIG.pointsExact+u.correct*CONFIG.pointsResult)/(u.exact+u.correct+u.wrong)/CONFIG.pointsExact)*100),
    exact:u.exact,correct:u.correct,wrong:u.wrong,
  }));

  const CustomTooltip=({active,payload,label})=>{
    if(!active||!payload?.length)return null;
    return(
      <div style={{background:t.surface,border:`1px solid ${t.border}`,
        borderRadius:10,padding:"8px 12px",fontFamily:"'Outfit',sans-serif"}}>
        <div style={{fontSize:11,fontWeight:700,color:t.text,marginBottom:4}}>{label}</div>
        {payload.map(p=>(
          <div key={p.dataKey} style={{fontSize:10,color:p.color}}>{p.dataKey}: {p.value}%</div>
        ))}
      </div>
    );
  };

  return(
    <div style={{flex:1,overflowY:"auto",padding:"16px 18px",fontFamily:"'Outfit',sans-serif"}}>

      {/* Top metrics */}
      <div className="anim-up" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        {[
          {icon:"⚽",label:"Total de Jogos",val:"16",color:t.acc},
          {icon:"🎯",label:"Placares Exatos",val:"14",color:t.green},
          {icon:"✅",label:"Resultados Certos",val:"40",color:t.gold},
          {icon:"👑",label:"Líder do Grupo",val:"Lucas",color:t.purple},
        ].map(({icon,label,val,color})=>(
          <div key={label} style={{borderRadius:14,padding:"14px",
            background:t.surface,border:`1px solid ${t.border}`}}>
            <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,color,lineHeight:1}}>{val}</div>
            <div style={{fontSize:9,color:t.sub,marginTop:3,textTransform:"uppercase",letterSpacing:.4}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Accuracy by user */}
      <div className="anim-up" style={{animationDelay:"60ms",borderRadius:16,
        padding:"16px 14px",background:t.surface,border:`1px solid ${t.border}`,marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:t.sub,letterSpacing:1,
          textTransform:"uppercase",marginBottom:14}}>% Acerto por Jogador</div>
        {perUserData.map((u,i)=>{
          const color=[t.acc,t.gold,t.purple,t.green,t.red,t.sub][i]||t.sub;
          return(
            <div key={u.name} className="anim-up"
              style={{animationDelay:`${i*50}ms`,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:t.text}}>
                  {u.name} {USERS[i].flag}
                </span>
                <span style={{fontSize:12,fontWeight:700,color}}>
                  {u.exact}E · {u.correct}R · {u.wrong}X
                </span>
              </div>
              <div style={{height:7,borderRadius:6,background:t.muted,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:6,
                  background:`linear-gradient(90deg,${color}88,${color})`,
                  width:`${(u.exact/(u.exact+u.correct+u.wrong))*100}%`,
                  transition:"width .8s ease"}}/>
              </div>
            </div>
          );
        })}
        <div style={{display:"flex",gap:12,marginTop:10,paddingTop:10,borderTop:`1px solid ${t.border}`}}>
          {[["E","Exato",t.acc],["R","Result.",t.gold],["X","Errou",t.red]].map(([k,l,c])=>(
            <div key={k} style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:c,display:"inline-block"}}/>
              <span style={{fontSize:10,color:t.sub}}>{k} = {l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Accuracy evolution by phase */}
      <div className="anim-up" style={{animationDelay:"120ms",borderRadius:16,
        padding:"16px 14px",background:t.surface,border:`1px solid ${t.border}`,marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:t.sub,letterSpacing:1,
          textTransform:"uppercase",marginBottom:14}}>Evolução por Fase (%)</div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={accuracyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false}/>
            <XAxis dataKey="fase" tick={{fontSize:9,fill:t.sub,fontFamily:"Outfit"}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:t.sub,fontFamily:"Outfit"}} axisLine={false} tickLine={false} width={24} domain={[30,100]}/>
            <Tooltip content={<CustomTooltip/>}/>
            {userNames.map((name,i)=>(
              <Line key={name} type="monotone" dataKey={name}
                stroke={userColors[i]} strokeWidth={2}
                dot={{r:3,fill:userColors[i],strokeWidth:0}}
                activeDot={{r:5}}/>
            ))}
          </LineChart>
        </ResponsiveContainer>
        <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:10}}>
          {userNames.map((n,i)=>(
            <div key={n} style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:12,height:3,borderRadius:2,background:userColors[i],display:"inline-block"}}/>
              <span style={{fontSize:10,color:t.sub}}>{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Donut summary */}
      <div className="anim-up" style={{animationDelay:"180ms",borderRadius:16,
        padding:"16px 14px",background:t.surface,border:`1px solid ${t.border}`,marginBottom:8}}>
        <div style={{fontSize:11,fontWeight:700,color:t.sub,letterSpacing:1,
          textTransform:"uppercase",marginBottom:14}}>Distribuição Total do Grupo</div>
        <div style={{display:"flex",gap:14,alignItems:"center"}}>
          <svg width={88} height={88} viewBox="0 0 36 36" style={{flexShrink:0}}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={t.border} strokeWidth="4"/>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={t.green} strokeWidth="4"
              strokeDasharray="22 78" strokeDashoffset="25" strokeLinecap="round"/>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={t.gold} strokeWidth="4"
              strokeDasharray="50 50" strokeDashoffset="3" strokeLinecap="round"/>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={t.red} strokeWidth="4"
              strokeDasharray="28 72" strokeDashoffset="-47" strokeLinecap="round"/>
            <text x="18" y="18.5" textAnchor="middle" fontSize="6.5" fontWeight="700"
              fill={t.text} fontFamily="Bebas Neue">72%</text>
            <text x="18" y="23.5" textAnchor="middle" fontSize="3.5"
              fill={t.sub} fontFamily="Outfit">acerto</text>
          </svg>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:9}}>
            {[[t.green,"Placar Exato","22%"],[t.gold,"Resultado Certo","50%"],[t.red,"Errou","28%"]].map(([c,l,v])=>(
              <div key={l}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:10,color:t.sub,display:"flex",alignItems:"center",gap:5}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>
                    {l}
                  </span>
                  <span style={{fontSize:10,fontWeight:700,color:c}}>{v}</span>
                </div>
                <div style={{height:5,borderRadius:4,background:t.muted,overflow:"hidden"}}>
                  <div style={{width:v,height:"100%",borderRadius:4,background:c}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{height:8}}/>
    </div>
  );
}

/* ─── SCREEN 6: BOLÃO — todos os palpites por partida ───────────────────── */
// Only shows BLOCKED stages (betting closed + results available)
function BolaoScreen({t}){
  const blockedStages = STAGES.filter(s=>s.status==="BLOCKED");
  const [stageIdx, setStageIdx] = useState(0); // starts at first blocked stage
  const [expanded, setExpanded] = useState({}); // matchId → bool

  const stage   = blockedStages[stageIdx];
  const matches = ALL_MATCHES.filter(m=>m.stageId===stage?.id && m.status==="finished");

  function toggle(id){ setExpanded(e=>({...e,[id]:!e[id]})); }

  // Colour + label helpers
  const RC = {
    exact:  {bg:t.greenDim, border:t.green+"44", text:t.green,  label:"🎯 Exato"},
    correct:{bg:t.goldDim,  border:t.gold +"44", text:t.gold,   label:"✓ Certo"},
    wrong:  {bg:t.redDim,   border:t.red  +"44", text:t.red,    label:"✗ Errou"},
    pending:{bg:t.muted,    border:t.border,      text:t.sub,    label:"—"},
  };

  // Summary row for a match: counts per result type
  function matchSummary(matchId, match){
    return USERS.reduce((acc,u)=>{
      const r = betResult(ALL_USER_BETS[matchId]?.[u.id], match);
      acc[r]=(acc[r]||0)+1;
      return acc;
    },{exact:0,correct:0,wrong:0});
  }

  return(
    <div style={{flex:1,overflowY:"auto",fontFamily:"'Outfit',sans-serif"}}>

      {/* Stage tabs — only BLOCKED */}
      <div style={{padding:"12px 18px 0",
        background:`linear-gradient(180deg,${t.bg2} 0%,${t.bg} 100%)`,
        borderBottom:`1px solid ${t.border}`}}>
        <div style={{fontSize:11,fontWeight:700,color:t.sub,letterSpacing:1,
          textTransform:"uppercase",marginBottom:10}}>
          Palpites encerrados
        </div>
        <div style={{display:"flex",gap:6,paddingBottom:12,overflowX:"auto"}}>
          {blockedStages.map((s,i)=>{
            const active=stageIdx===i;
            const cnt=ALL_MATCHES.filter(m=>m.stageId===s.id&&m.status==="finished").length;
            return(
              <button key={s.id} onClick={()=>{setStageIdx(i);setExpanded({});}}
                style={{
                  flexShrink:0,borderRadius:10,padding:"6px 14px",border:"none",cursor:"pointer",
                  background:active?t.acc:t.surface,
                  border:`1.5px solid ${active?t.acc:t.border}`,
                  fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:12,
                  color:active?(t.isDark?"#070d18":"#fff"):t.sub,
                  transition:"all .18s",display:"flex",alignItems:"center",gap:6}}>
                {s.short}
                <span style={{fontSize:9,padding:"1px 5px",borderRadius:5,
                  background:active?(t.isDark?"rgba(0,0,0,.2)":"rgba(255,255,255,.3)"):t.muted,
                  color:active?(t.isDark?"#070d18":"#fff"):t.mutedT,fontWeight:700}}>
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Match cards */}
      <div style={{padding:"14px 18px"}}>
        {matches.length===0&&(
          <div style={{textAlign:"center",padding:"48px 0",color:t.sub}}>
            <div style={{fontSize:32,marginBottom:10}}>🔍</div>
            <div style={{fontSize:14,fontWeight:600}}>Nenhuma partida encerrada</div>
          </div>
        )}

        {matches.map((m,mi)=>{
          const isOpen=expanded[m.id];
          const summary=matchSummary(m.id,m);
          const matchBets=ALL_USER_BETS[m.id]||{};

          return(
            <div key={m.id} className="anim-up"
              style={{animationDelay:`${mi*55}ms`,marginBottom:12,
                borderRadius:16,overflow:"hidden",
                border:`1px solid ${t.border}`,background:t.surface}}>

              {/* ── Match header (always visible) ── */}
              <div style={{padding:"12px 14px",cursor:"pointer"}} onClick={()=>toggle(m.id)}>

                {/* Top row */}
                <div style={{display:"flex",justifyContent:"space-between",
                  alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:10,color:t.sub,fontWeight:600,
                    textTransform:"uppercase",letterSpacing:.5}}>
                    {m.date.slice(8)}/{m.date.slice(5,7)} · {m.time}
                  </span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{display:"flex",gap:4}}>
                      {[["exact",t.green],["correct",t.gold],["wrong",t.red]].map(([r,c])=>(
                        summary[r]>0&&(
                          <span key={r} style={{fontSize:9,fontWeight:700,color:c,
                            background:`${c}15`,padding:"1px 6px",borderRadius:5,
                            border:`1px solid ${c}33`}}>
                            {summary[r]}
                          </span>
                        )
                      ))}
                    </div>
                    <span style={{fontSize:14,color:t.sub,transform:isOpen?"rotate(180deg)":"none",
                      transition:"transform .25s",display:"inline-block"}}>
                      ▾
                    </span>
                  </div>
                </div>

                {/* Teams + final score */}
                <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",
                  gap:8,alignItems:"center"}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:26}}>{m.hf}</div>
                    <div style={{fontSize:11,fontWeight:700,color:t.text,marginTop:2}}>{m.home}</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:10,color:t.sub,textTransform:"uppercase",
                      letterSpacing:.5,marginBottom:2}}>Resultado</div>
                    <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:30,
                      color:t.text,letterSpacing:4,lineHeight:1}}>
                      {m.hs}&nbsp;–&nbsp;{m.as}
                    </div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:26}}>{m.af}</div>
                    <div style={{fontSize:11,fontWeight:700,color:t.text,marginTop:2}}>{m.away}</div>
                  </div>
                </div>
              </div>

              {/* ── Expanded: all players' bets ── */}
              {isOpen&&(
                <div style={{borderTop:`1px solid ${t.border}`,
                  animation:"fadeUp .25s ease"}}>

                  {/* Column headers */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 64px 90px 64px",
                    padding:"7px 14px",background:t.surf2,
                    borderBottom:`1px solid ${t.border}`}}>
                    {["Jogador","Palpite","Resultado","Pts"].map(h=>(
                      <div key={h} style={{fontSize:9,fontWeight:700,color:t.sub,
                        letterSpacing:.8,textTransform:"uppercase",
                        textAlign:h==="Jogador"?"left":"center"}}>
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* One row per user */}
                  {USERS.map((u,ui)=>{
                    const bet  = matchBets[u.id];
                    const res  = betResult(bet,m);
                    const rc   = RC[res]||RC.pending;
                    const pts  = resultPts(res);
                    const isMe = u.id===ME.id;

                    return(
                      <div key={u.id}
                        style={{display:"grid",gridTemplateColumns:"1fr 64px 90px 64px",
                          padding:"9px 14px",alignItems:"center",
                          background:isMe?`${t.acc}08`:"transparent",
                          borderBottom:ui<USERS.length-1?`1px solid ${t.border}`:"none",
                          transition:"background .15s"}}>

                        {/* Player */}
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,
                            background:`linear-gradient(135deg,${t.acc},${t.gold})`,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontFamily:"'Bebas Neue',cursive",fontSize:11,
                            color:t.isDark?"#070d18":"#fff",
                            border:isMe?`2px solid ${t.acc}`:`1.5px solid ${t.border}`}}>
                            {u.avatar}
                          </div>
                          <div>
                            <div style={{fontSize:12,fontWeight:isMe?700:600,color:t.text,
                              display:"flex",alignItems:"center",gap:4}}>
                              {u.name}
                              {isMe&&<span style={{fontSize:8,color:t.acc,fontWeight:700,
                                background:t.accDim,padding:"0 4px",borderRadius:3}}>
                                Você
                              </span>}
                            </div>
                            <div style={{fontSize:10,color:t.sub}}>{u.flag}</div>
                          </div>
                        </div>

                        {/* Bet score */}
                        <div style={{textAlign:"center"}}>
                          {bet
                            ? <span style={{fontFamily:"'Bebas Neue',cursive",
                                fontSize:18,color:rc.text,letterSpacing:2}}>
                                {bet.h}–{bet.a}
                              </span>
                            : <span style={{fontSize:11,color:t.mutedT}}>—</span>}
                        </div>

                        {/* Result badge */}
                        <div style={{textAlign:"center"}}>
                          <span style={{fontSize:9,fontWeight:700,color:rc.text,
                            background:rc.bg,padding:"3px 7px",borderRadius:6,
                            border:`1px solid ${rc.border}`,whiteSpace:"nowrap"}}>
                            {rc.label}
                          </span>
                        </div>

                        {/* Points */}
                        <div style={{textAlign:"center"}}>
                          <span style={{fontFamily:"'Bebas Neue',cursive",
                            fontSize:18,color:pts>0?rc.text:t.mutedT}}>
                            {pts>0?`+${pts}`:pts}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Match totals footer */}
                  <div style={{padding:"8px 14px 10px",background:t.surf2,
                    display:"flex",justifyContent:"space-between",alignItems:"center",
                    borderTop:`1px solid ${t.border}`}}>
                    <span style={{fontSize:10,color:t.sub,fontWeight:600}}>
                      {USERS.length} palpites
                    </span>
                    <div style={{display:"flex",gap:10}}>
                      {[["🎯",summary.exact,t.green],["✓",summary.correct,t.gold],["✗",summary.wrong,t.red]].map(([ic,n,c])=>(
                        <span key={ic} style={{fontSize:10,color:c,fontWeight:700,
                          display:"flex",alignItems:"center",gap:3}}>
                          {ic} {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div style={{height:8}}/>
      </div>
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────────────────────── */
export default function App(){
  const [isDark,setIsDark]=useState(true);
  const [auth,setAuth]=useState(false);
  const [screen,setScreen]=useState("home");
  const t=isDark?DARK:LIGHT;

  // screen transition state
  const [key,setKey]=useState(0);
  function nav(s){
    if(s===screen)return;
    setScreen(s);
    setKey(k=>k+1);
  }

  const screens={home:<HomeScreen t={t} onNav={nav}/>,
    bets:<BetsScreen t={t}/>,bolao:<BolaoScreen t={t}/>,
    rank:<RankingScreen t={t}/>,stats:<StatsScreen t={t}/>};

  return(
    <div style={{width:"100%",minHeight:"100vh",background:t.bg,
      display:"flex",flexDirection:"column",alignItems:"center",fontFamily:"'Outfit',sans-serif"}}>
      <style>{G}</style>

      {/* App shell — mobile-first, max 430px */}
      <div style={{width:"100%",maxWidth:430,minHeight:"100vh",
        display:"flex",flexDirection:"column",background:t.bg,position:"relative"}}>

        {!auth
          ? <LoginScreen t={t} onLogin={()=>setAuth(true)}/>
          : <>
              <Header t={t} onToggleTheme={()=>setIsDark(d=>!d)} screen={screen}/>
              <div key={key} style={{flex:1,display:"flex",flexDirection:"column",
                overflow:"hidden",animation:"fadeIn .3s ease"}}>
                {screens[screen]}
              </div>
              <BottomNav active={screen} onNav={nav} t={t}/>
            </>
        }
      </div>
    </div>
  );
}
