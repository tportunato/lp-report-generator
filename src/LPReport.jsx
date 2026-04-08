import React, { useState, useRef, useCallback } from "react";

// ─── BRAND TOKENS ─────────────────────────────────────────────────────────────
const B = {
  navy:       "#0F2744",
  navyLight:  "#1A3A5C",
  terracotta: "#C8692A",
  terracottaLight: "#E8845A",
  terracottaDark:  "#A8521E",
  offWhite:   "#F7F5F1",
  white:      "#FFFFFF",
  border:     "#E8E5DE",
  borderDark: "#D4CFC6",
  textPrimary:"#0F2744",
  textSecondary:"#5A6070",
  textMuted:  "#9097A3",
  success:    "#2E7D32",
  successBg:  "#E8F5E9",
  successBorder:"#A5D6A7",
  warning:    "#7D5A00",
  warningBg:  "#FFF8E8",
  warningBorder:"#E8D080",
  danger:     "#B03020",
  dangerBg:   "#FDF0EE",
  dangerBorder:"#E8C0B8",
  info:       "#1A3D7A",
  infoBg:     "#EDF2FB",
  infoBorder: "#B8CCEC",
};

// ─── SPACING ──────────────────────────────────────────────────────────────────
const SP = { xs:4, sm:8, md:12, base:16, lg:24, xl:48 };

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const STRATEGIES = ["Core","Core+","Value-Add","Opportunistic","Debt"];
const FUND_STAGES = ["Fundraising","Investment Period","Harvest / Disposal","Winding Down"];
const CURRENCIES = ["EUR","USD","GBP","CHF"];
const AUDIENCES = [{value:"institutional",label:"Institutional LP"},{value:"fo",label:"Family Office"},{value:"hnw",label:"HNW / Private Client"},{value:"mixed",label:"Mixed LP Base"}];
const TONES = [{value:"formal",label:"Formal & Precise"},{value:"narrative",label:"Narrative & Accessible"},{value:"concise",label:"Concise Factual"},{value:"cautious",label:"Cautious / Conservative"}];
const ROLES = ["Junior Analyst","Senior Analyst","Associate","Vice President","Director","Managing Director","Fund Manager","Compliance Officer"];
const ASSET_TAGS = ["Lease Event","Capex Underway","Under Offer","Disposal","Covenant Watch","Valuation Change","New Tenant","Vacancy Risk"];
const MKT_GEO = ["France","Italy","Netherlands","Germany","Spain","Belgium","Pan-European"];
const MKT_SRC = ["Broker Research","Consultant Report","Agency Data","Central Bank","Internal Analysis","Press / News","Other"];

const SECTION_LIB = [
  {id:"cover",     label:"Cover page",             desc:"Fund name, period, branding",      core:true,  pages:1},
  {id:"exec",      label:"Executive summary",       desc:"Market, valuation, strategy",      core:true,  pages:2},
  {id:"highlights",label:"Financial highlights",    desc:"NAV by share class, GAV",          core:true,  pages:2},
  {id:"am",        label:"Asset management report", desc:"Rent roll, valuation, debt",       core:true,  pages:3},
  {id:"assets",    label:"Asset pages",             desc:"One page per asset",               core:true,  pages:5},
  {id:"market",    label:"Market outlook",          desc:"EU logistics by country",          core:false, pages:2},
  {id:"esg",       label:"ESG reporting",           desc:"Commitment tracker",               core:false, pages:1},
  {id:"inrev",     label:"INREV / Financials",      desc:"Statement of assets, NAV bridge",  core:false, pages:3},
  {id:"disclaimer",label:"Disclaimer",              desc:"Legal language",                   core:true,  pages:1},
  {id:"pipeline",  label:"Pipeline & deployment",   desc:"New acquisitions in progress",     core:false, pages:1},
  {id:"cashflow",  label:"Fund cashflow summary",   desc:"Distributions, capital calls",     core:false, pages:2},
  {id:"disposal",  label:"Disposal progress",       desc:"Exit timeline, bid activity",      core:false, pages:2},
  {id:"debt_deep", label:"Debt strategy deep-dive", desc:"Refinancing plan, covenant watch", core:false, pages:2},
  {id:"custom",    label:"Custom section",          desc:"Free-form — you write the prompt", core:false, pages:1, custom:true},
];
const PRESETS = {
  "Standard":       ["cover","exec","highlights","am","assets","market","esg","inrev","disclaimer"],
  "Disposal phase": ["cover","exec","highlights","am","assets","disposal","debt_deep","cashflow","disclaimer"],
  "Concise FO/HNW": ["cover","exec","highlights","assets","disclaimer"],
  "Institutional":  ["cover","exec","highlights","am","assets","market","esg","inrev","pipeline","cashflow","disclaimer"],
  "Start blank":    [],
};

const DEFAULT_ASSETS = [
  {id:1,name:"Logistics Hub Île-de-France",    country:"France",      type:"Logistics",  area:42000,bookValue:28.4,fairValue:31.2,occupancy:97, walb:5.2,tenants:"DHL, Amazon"},
  {id:2,name:"Milan North Distribution Centre",country:"Italy",       type:"Logistics",  area:35000,bookValue:19.8,fairValue:21.5,occupancy:100,walb:6.8,tenants:"GXO Logistics"},
  {id:3,name:"Rotterdam Gateway Warehouse",    country:"Netherlands", type:"Last-Mile",  area:28000,bookValue:22.1,fairValue:24.0,occupancy:94, walb:3.1,tenants:"PostNL, CEVA"},
  {id:4,name:"Lyon Cross-Dock Facility",       country:"France",      type:"Cross-Dock", area:18500,bookValue:11.6,fairValue:12.8,occupancy:100,walb:7.5,tenants:"XPO Logistics"},
  {id:5,name:"Amsterdam Urban Last-Mile",      country:"Netherlands", type:"Last-Mile",  area:9800, bookValue:8.9, fairValue:9.4, occupancy:88, walb:2.3,tenants:"Coolblue, Picnic"},
];
const DEFAULT_DEBT = [
  {id:1,assetRef:"Logistics Hub Île-de-France",    lender:"Société Générale",outstanding:16.2,ltv:52,margin:180,maturity:"2027-06",covenantLtv:65,covenantDscr:1.25,hedged:true},
  {id:2,assetRef:"Milan North Distribution Centre",lender:"UniCredit",        outstanding:11.4,ltv:53,margin:195,maturity:"2028-02",covenantLtv:65,covenantDscr:1.20,hedged:true},
  {id:3,assetRef:"Rotterdam Gateway Warehouse",    lender:"ING Bank",         outstanding:13.2,ltv:55,margin:175,maturity:"2027-09",covenantLtv:65,covenantDscr:1.25,hedged:false},
  {id:4,assetRef:"Lyon Cross-Dock Facility",       lender:"BNP Paribas",      outstanding:6.5, ltv:51,margin:185,maturity:"2030-04",covenantLtv:65,covenantDscr:1.20,hedged:true},
  {id:5,assetRef:"Amsterdam Urban Last-Mile",      lender:"ABN AMRO",         outstanding:5.1, ltv:54,margin:190,maturity:"2028-11",covenantLtv:65,covenantDscr:1.25,hedged:false},
];

const DEFAULT_FIN = {
  priorNav: 58.2,
  valuationMovement: 2.4,
  incomeAccrued: 1.8,
  feesExpenses: -0.9,
  distributions: -1.2,
  otherMovements: 0,
  liabilities: 3.2,
  shareClasses: [{id:"sc1", name:"Class A — Institutional EUR", units: 58200, currency:"EUR"}],
};

const fmtM   = v => `€${Number(v).toFixed(1)}m`;
const nowStr = () => new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
const mkA    = () => ({id:uid(),name:"",country:"France",type:"Logistics",area:0,bookValue:0,fairValue:0,occupancy:100,walb:5.0,tenants:""});
const mkD    = (r="") => ({id:uid(),assetRef:r,lender:"",outstanding:0,ltv:50,margin:180,maturity:"",covenantLtv:65,covenantDscr:1.25,hedged:false});
function uid(){return Math.random().toString(36).slice(2,9);}

// ─── BRAND UI COMPONENTS ──────────────────────────────────────────────────────
const FF = "'DM Sans', sans-serif";

function Lbl({c,r}){
  return <div style={{fontSize:11,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:B.textSecondary,fontFamily:FF,marginBottom:5}}>
    {c}{r&&<span style={{color:B.danger,marginLeft:3}}>*</span>}
  </div>;
}

function Inp({value,onChange,placeholder,type="text",st={}}){
  return <input
    type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{width:"100%",boxSizing:"border-box",padding:"8px 12px",fontSize:13,fontFamily:FF,
      border:`0.5px solid ${B.border}`,borderRadius:6,background:B.white,color:B.textPrimary,
      outline:"none",...st}}
    onFocus={e=>{e.target.style.borderColor=B.terracotta;e.target.style.boxShadow=`0 0 0 2px ${B.terracotta}18`;}}
    onBlur={e=>{e.target.style.borderColor=B.border;e.target.style.boxShadow="none";}}
  />;
}

function Sel({value,onChange,opts}){
  return <select value={value} onChange={e=>onChange(e.target.value)}
    style={{width:"100%",padding:"8px 12px",fontSize:13,fontFamily:FF,
      border:`0.5px solid ${B.border}`,borderRadius:6,background:B.white,
      color:value?B.textPrimary:B.textMuted,outline:"none",cursor:"pointer",
      appearance:"none",
      backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235A6070'/%3E%3C/svg%3E")`,
      backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center"}}>
    {opts.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}
  </select>;
}

// Three button variants: primary (terracotta), secondary (outline), ghost
function Btn({children,onClick,v="ghost",sz="sm",disabled,st={}}){
  const base={fontFamily:FF,fontWeight:600,cursor:disabled?"not-allowed":"pointer",borderRadius:6,
    fontSize:sz==="sm"?12:13,padding:sz==="sm"?"7px 14px":"10px 26px",transition:"all 0.12s",
    letterSpacing:"0.02em",border:"none"};
  const vs={
    primary:{background:disabled?B.textMuted:B.terracotta,color:B.white,border:"none",
      opacity:disabled?0.6:1},
    secondary:{background:"transparent",color:B.navy,border:`0.5px solid ${B.navy}`,opacity:disabled?0.5:1},
    ghost:{background:"transparent",color:B.textSecondary,border:`0.5px solid ${B.border}`,opacity:disabled?0.5:1},
    danger:{background:"transparent",color:B.danger,border:`0.5px solid ${B.dangerBorder}`,opacity:disabled?0.5:1},
    blue:{background:B.infoBg,color:B.info,border:`0.5px solid ${B.infoBorder}`,opacity:disabled?0.5:1},
    green:{background:B.successBg,color:B.success,border:`0.5px solid ${B.successBorder}`,opacity:disabled?0.5:1},
  };
  return <button onClick={onClick} disabled={disabled}
    style={{...base,...(vs[v]||vs.ghost),...st}}
    onMouseEnter={e=>{if(!disabled&&v==="primary")e.currentTarget.style.background=B.terracottaDark;}}
    onMouseLeave={e=>{if(!disabled&&v==="primary")e.currentTarget.style.background=B.terracotta;}}
  >{children}</button>;
}

// Brand card: white bg, 0.5px border, 12px radius, no shadow
function Card({title,sub,children,action}){
  return <div style={{marginBottom:SP.base,border:`0.5px solid ${B.border}`,borderRadius:12,background:B.white,overflow:"hidden"}}>
    <div style={{padding:`${SP.md}px ${SP.lg}px`,borderBottom:`0.5px solid ${B.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-end",background:B.offWhite}}>
      <div>
        <div style={{fontSize:13,fontWeight:700,color:B.textPrimary,fontFamily:FF}}>{title}</div>
        {sub&&<div style={{fontSize:11,color:B.textMuted,fontFamily:FF,marginTop:2}}>{sub}</div>}
      </div>
      {action}
    </div>
    <div style={{padding:`${SP.base}px ${SP.lg}px`}}>{children}</div>
  </div>;
}

function G2({children}){return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:`${SP.md}px ${SP.lg}px`}}>{children}</div>}
function FG({label,r,children}){return <div><Lbl c={label} r={r}/>{children}</div>}

// Brand tag system
function Tag({children,variant="default"}){
  const vs={
    core:{background:B.infoBg,color:B.info,border:`0.5px solid ${B.infoBorder}`},
    opt:{background:B.offWhite,color:B.textSecondary,border:`0.5px solid ${B.border}`},
    custom:{background:"#EDE9FE",color:"#5C35CC",border:"0.5px solid #C4B5FD"},
    parked:{background:B.warningBg,color:B.warning,border:`0.5px solid ${B.warningBorder}`},
    resolved:{background:B.successBg,color:B.success,border:`0.5px solid ${B.successBorder}`},
    default:{background:B.offWhite,color:B.textSecondary,border:`0.5px solid ${B.border}`},
  };
  return <span style={{fontSize:9,padding:"2px 6px",borderRadius:4,fontFamily:FF,fontWeight:700,letterSpacing:"0.05em",...(vs[variant]||vs.default)}}>{children}</span>;
}

function DZ({onFile,file,label,accept=".pdf,.docx",opt}){
  const ref=useRef(); const [d,setD]=useState(false);
  return <div onClick={()=>ref.current.click()}
    onDragOver={e=>{e.preventDefault();setD(true);}}
    onDragLeave={()=>setD(false)}
    onDrop={e=>{e.preventDefault();setD(false);const f=e.dataTransfer.files[0];if(f)onFile(f);}}
    style={{border:`1px dashed ${d?B.terracotta:B.borderDark}`,borderRadius:8,padding:SP.md,textAlign:"center",cursor:"pointer",background:d?`${B.terracotta}08`:B.offWhite}}>
    <input ref={ref} type="file" accept={accept} style={{display:"none"}} onChange={e=>e.target.files[0]&&onFile(e.target.files[0])}/>
    {file?<div>
      <div style={{fontSize:12,color:B.terracotta,fontWeight:600,fontFamily:FF}}>{file.name}</div>
      <div style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>Click to replace</div>
    </div>:<div>
      <div style={{fontSize:16,color:B.textMuted,marginBottom:3}}>↑</div>
      <div style={{fontSize:12,color:B.textSecondary,fontFamily:FF}}>{label}</div>
      {opt&&<div style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>optional</div>}
    </div>}
  </div>;
}

function MDrop({files,onAdd,onRemove,label}){
  const ref=useRef(); const [d,setD]=useState(false);
  return <div>
    <div onClick={()=>ref.current.click()}
      onDragOver={e=>{e.preventDefault();setD(true);}}
      onDragLeave={()=>setD(false)}
      onDrop={e=>{e.preventDefault();setD(false);Array.from(e.dataTransfer.files).forEach(onAdd);}}
      style={{border:`1px dashed ${d?B.terracotta:B.borderDark}`,borderRadius:8,padding:SP.md,textAlign:"center",cursor:"pointer",background:d?`${B.terracotta}08`:B.offWhite,marginBottom:files.length?SP.sm:0}}>
      <input ref={ref} type="file" multiple style={{display:"none"}} onChange={e=>Array.from(e.target.files).forEach(onAdd)}/>
      <div style={{fontSize:13,color:B.textMuted,marginBottom:2}}>↑</div>
      <div style={{fontSize:12,color:B.textSecondary,fontFamily:FF}}>{label}</div>
    </div>
    {files.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:`${SP.sm}px ${SP.md}px`,background:B.offWhite,borderRadius:6,border:`0.5px solid ${B.border}`,marginBottom:4}}>
      <span style={{fontSize:12,color:B.terracotta,fontFamily:FF}}>📄 {f.name}</span>
      <button onClick={()=>onRemove(i)} style={{background:"none",border:"none",color:B.danger,cursor:"pointer",fontSize:14}}>×</button>
    </div>)}
  </div>;
}

function EC({value,onChange,type="text",align="left",prefix=""}){
  const [e,setE]=useState(false);
  if(e) return <input autoFocus type={type} value={value}
    onChange={ev=>onChange(type==="number"?parseFloat(ev.target.value)||0:ev.target.value)}
    onBlur={()=>setE(false)}
    style={{width:"100%",padding:"3px 6px",fontSize:12,fontFamily:FF,border:`0.5px solid ${B.terracotta}`,borderRadius:4,background:B.white,textAlign:align,boxSizing:"border-box"}}/>;
  return <div onClick={()=>setE(true)}
    style={{cursor:"text",padding:"3px 5px",fontSize:12,color:B.textPrimary,fontFamily:FF,textAlign:align,borderRadius:4,minHeight:20}}
    onMouseEnter={ev=>ev.currentTarget.style.background=B.offWhite}
    onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
    {prefix}{value||<span style={{color:B.borderDark}}>—</span>}
  </div>;
}

function StepBar({cur}){
  const steps=["Fund Config","Data Intake","Report Structure","Review & Flags","Generate & Export"];
  return <div style={{display:"flex",alignItems:"center",marginBottom:SP.lg}}>
    {steps.map((s,i)=>(
      <div key={i} style={{display:"flex",alignItems:"center",flex:i<4?1:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:SP.sm,flexShrink:0}}>
          <div style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,fontFamily:FF,
            background:cur===i+1?B.terracotta:cur>i+1?B.navy:"transparent",
            border:cur===i+1?`2px solid ${B.terracotta}`:cur>i+1?`2px solid ${B.navy}`:`2px solid ${B.border}`,
            color:cur>=i+1?B.white:B.textMuted}}>
            {cur>i+1?"✓":i+1}
          </div>
          <span style={{fontSize:11,fontFamily:FF,fontWeight:cur===i+1?700:400,
            color:cur===i+1?B.terracotta:cur>i+1?B.navy:B.textMuted,whiteSpace:"nowrap"}}>
            {s}
          </span>
        </div>
        {i<4&&<div style={{flex:1,height:"0.5px",background:cur>i+1?B.navy:B.border,margin:`0 ${SP.md}px`}}/>}
      </div>
    ))}
  </div>;
}

// ─── ENGINES ──────────────────────────────────────────────────────────────────
function getFlags(assets,debt,mkt,structure,notes){
  const f=[];
  assets.filter(a=>a.walb<3).forEach(a=>f.push({id:`w${a.id}`,sev:a.walb<2?"critical":"warning",cat:"Lease Risk",title:`Short WALB — ${a.name.split(" ").slice(0,3).join(" ")}`,detail:`WALB ${a.walb}y below 3-year threshold. Narrative must address lease expiry risk.`,sec:"am",ref:`Asset table → ${a.name}`}));
  debt.filter(d=>d.covenantLtv&&(d.ltv/d.covenantLtv)>0.80).forEach(d=>{const p=((d.ltv/d.covenantLtv)*100).toFixed(0);f.push({id:`c${d.id}`,sev:(d.ltv/d.covenantLtv)>0.90?"critical":"warning",cat:"Covenant Watch",title:`Covenant proximity — ${(d.assetRef||"").split(" ").slice(0,3).join(" ")}`,detail:`LTV ${d.ltv}% is ${p}% of ${d.covenantLtv}% ceiling (${d.lender}).`,sec:"am",ref:`Debt → ${d.assetRef}`});});
  assets.filter(a=>a.occupancy<90).forEach(a=>f.push({id:`v${a.id}`,sev:a.occupancy<80?"critical":"warning",cat:"Occupancy",title:`Sub-90% occupancy — ${a.name.split(" ").slice(0,3).join(" ")}`,detail:`Occ ${a.occupancy}%. Narrative must address vacant space and leasing pipeline.`,sec:"assets",ref:`Asset table → ${a.name}`}));
  assets.filter(a=>!notes[a.id]||notes[a.id].trim().length<20).forEach(a=>f.push({id:`n${a.id}`,sev:"info",cat:"Data Gap",title:`Thin note — ${a.name.split(" ").slice(0,3).join(" ")}`,detail:"No meaningful commentary. AI will produce generic narrative.",sec:"assets",ref:`Asset Updates → ${a.name}`}));
  if(structure.active.some(s=>s.id==="market"&&!s.parked)&&mkt.files.length===0&&mkt.sources.length===0) f.push({id:"mg",sev:"warning",cat:"Data Gap",title:"Market Outlook has no source data",detail:"Market section active but no research provided. High hallucination risk.",sec:"market",ref:"Data Intake → Market Context"});
  assets.filter(a=>a.occupancy<88&&a.fairValue>a.bookValue).forEach(a=>{const u=(((a.fairValue-a.bookValue)/a.bookValue)*100).toFixed(1);f.push({id:`d${a.id}`,sev:"warning",cat:"Directional Logic",title:`Uplift + sub-88% occ — ${a.name.split(" ").slice(0,3).join(" ")}`,detail:`FV +${u}% vs BV yet occ ${a.occupancy}%. Note must explain valuation driver.`,sec:"highlights",ref:`Asset table → ${a.name}`});});
  const now=new Date();
  debt.filter(d=>!d.hedged&&d.maturity).forEach(d=>{const mo=(new Date(d.maturity)-now)/(2592000000);if(mo<18)f.push({id:`h${d.id}`,sev:mo<9?"critical":"warning",cat:"Debt / Rate Risk",title:`Unhedged debt <18m — ${(d.assetRef||"").split(" ").slice(0,3).join(" ")}`,detail:`${d.lender} €${d.outstanding}m unhedged matures ${d.maturity}. Material disclosure.`,sec:"am",ref:`Debt → ${d.assetRef}`});});
  return f;
}

function getCov(sid,assets,debt,mkt,notes){
  const m={
    cover:[{l:"Fund name",ok:true},{l:"Period",ok:true}],
    exec:[{l:"Valuations",ok:assets.every(a=>a.fairValue>0)},{l:"Occupancy",ok:assets.every(a=>a.occupancy>0)},{l:"Market context",ok:mkt.sources.length>0||mkt.files.length>0},{l:"Analyst notes",ok:assets.some(a=>notes[a.id]?.length>10)}],
    highlights:[{l:"Fair values",ok:assets.every(a=>a.fairValue>0)},{l:"Book values",ok:assets.every(a=>a.bookValue>0)},{l:"Debt data",ok:debt.length>0}],
    am:[{l:"Rent roll",ok:assets.every(a=>a.tenants)},{l:"WALB",ok:assets.every(a=>a.walb>0)},{l:"Debt table",ok:debt.length>0},{l:"AM notes",ok:assets.every(a=>notes[a.id]?.length>10)}],
    assets:[{l:"Valuations",ok:assets.every(a=>a.fairValue>0)},{l:"Tenants",ok:assets.every(a=>a.tenants)},{l:"GLA",ok:assets.every(a=>a.area>0)},{l:"Notes",ok:assets.every(a=>notes[a.id]?.length>10)}],
    market:[{l:"Market files",ok:mkt.files.length>0},{l:"Data points",ok:mkt.sources.length>0}],
    esg:[{l:"ESG data",ok:false}],inrev:[{l:"NAV data",ok:assets.every(a=>a.fairValue>0)},{l:"Debt",ok:debt.length>0}],
    disclaimer:[{l:"Legal text",ok:true}],pipeline:[{l:"Pipeline notes",ok:false}],cashflow:[{l:"Cashflow data",ok:false}],
    disposal:[{l:"Disposal data",ok:false}],debt_deep:[{l:"Debt table",ok:debt.length>0},{l:"Covenants",ok:debt.every(d=>d.covenantLtv>0)}],custom:[{l:"Prompt",ok:true}],
  };
  return m[sid]||[];
}

// ─── SESSION GATE ─────────────────────────────────────────────────────────────
function SessionGate({onConfirm}){
  const [name,setName]=useState(""); const [role,setRole]=useState("Senior Analyst");
  return <div style={{position:"fixed",inset:0,background:"rgba(15,39,68,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
    <div style={{background:B.white,borderRadius:12,padding:"32px 36px",maxWidth:400,width:"90%",border:`0.5px solid ${B.border}`}}>
      <div style={{fontSize:18,color:B.navy,fontFamily:FF,fontWeight:700,marginBottom:2}}>Session Identity</div>
      <div style={{fontSize:12,color:B.textMuted,fontFamily:FF,marginBottom:SP.lg}}>Required for audit trail and approval logging</div>
      <div style={{marginBottom:SP.md}}><Lbl c="Full Name" r/><Inp value={name} onChange={setName} placeholder="e.g. Tomaso Portunato"/></div>
      <div style={{marginBottom:SP.lg}}><Lbl c="Role" r/><Sel value={role} onChange={setRole} opts={ROLES}/></div>
      <div style={{fontSize:12,color:B.textSecondary,fontFamily:FF,lineHeight:1.6,marginBottom:SP.lg,background:B.offWhite,padding:"10px 12px",borderRadius:6,border:`0.5px solid ${B.border}`}}>
        Your name and timestamp will be recorded on every flag resolution, section sign-off, and the final export audit log.
      </div>
      <Btn onClick={()=>name.trim().length>2&&onConfirm({name:name.trim(),role})} disabled={name.trim().length<=2} v="primary" sz="lg" st={{width:"100%",textAlign:"center"}}>
        Begin Session as {name.trim()||"…"}
      </Btn>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1
// ═══════════════════════════════════════════════════════════════════════════════
function Step1({cfg,setCfg,onNext}){
  const u=k=>v=>setCfg(c=>({...c,[k]:v}));
  const ub=k=>v=>setCfg(c=>({...c,branding:{...c.branding,[k]:v}}));
  const b=cfg.branding;
  const valid=cfg.fundName&&cfg.reportingPeriod&&cfg.strategy&&cfg.fundStage&&cfg.currency&&cfg.audience&&cfg.tone;
  const [logoP,setLogoP]=useState(null);

  const chipStyle=(active)=>({
    padding:"8px 10px",textAlign:"left",cursor:"pointer",borderRadius:6,fontFamily:FF,fontSize:12,fontWeight:active?600:400,
    border:`0.5px solid ${active?B.navy:B.border}`,
    background:active?B.navy:"transparent",
    color:active?B.white:B.textSecondary,
    transition:"all 0.1s",
  });

  return <div>
    <Card title="Fund Identity">
      <G2>
        <FG label="Fund Name" r><Inp value={cfg.fundName} onChange={u("fundName")} placeholder="e.g. Meridian European Logistics Fund II"/></FG>
        <FG label="Reporting Period" r><Inp value={cfg.reportingPeriod} onChange={u("reportingPeriod")} placeholder="Q3 2024"/></FG>
        <FG label="Strategy" r><Sel value={cfg.strategy} onChange={u("strategy")} opts={["",...STRATEGIES]}/></FG>
        <FG label="Fund Stage" r><Sel value={cfg.fundStage} onChange={u("fundStage")} opts={["",...FUND_STAGES]}/></FG>
        <FG label="Base Currency" r><Sel value={cfg.currency} onChange={u("currency")} opts={CURRENCIES}/></FG>
        <FG label="Reporting Date"><Inp value={cfg.reportingDate} onChange={u("reportingDate")} type="date"/></FG>
      </G2>
    </Card>
    <Card title="Audience & Tone">
      <G2>
        <FG label="Target Audience" r>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:SP.sm}}>
            {AUDIENCES.map(a=><button key={a.value} onClick={()=>u("audience")(a.value)} style={chipStyle(cfg.audience===a.value)}>{a.label}</button>)}
          </div>
        </FG>
        <FG label="Tone" r>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:SP.sm}}>
            {TONES.map(t=><button key={t.value} onClick={()=>u("tone")(t.value)} style={chipStyle(cfg.tone===t.value)}>{t.label}</button>)}
          </div>
        </FG>
      </G2>
    </Card>
    <Card title="Branding" sub="Brand assets and conventions calibrate the AI output style.">
      <G2>
        <div>
          <Lbl c="Logo"/>
          {logoP?<div style={{border:`0.5px solid ${B.border}`,borderRadius:6,padding:SP.md,display:"flex",gap:SP.md,alignItems:"center"}}>
            <img src={logoP} alt="" style={{maxHeight:34,maxWidth:90,objectFit:"contain"}}/>
            <button onClick={()=>{ub("logo")(null);setLogoP(null);}} style={{fontSize:11,color:B.danger,background:"none",border:"none",cursor:"pointer"}}>Remove</button>
          </div>:<DZ onFile={f=>{ub("logo")(f);const r=new FileReader();r.onload=e=>setLogoP(e.target.result);r.readAsDataURL(f);}} file={null} label="Upload logo" accept=".png,.svg,.jpg" opt/>}
        </div>
        <div><Lbl c="Primary Font"/><Inp value={b.primaryFont} onChange={ub("primaryFont")} placeholder="e.g. Calibri"/></div>
      </G2>
      <div style={{marginTop:SP.md}}>
        <Lbl c="Brand Colours"/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:SP.md}}>
          {[["colorPrimary","Primary"],["colorSecondary","Secondary"],["colorAccent","Accent"]].map(([k,l])=>(
            <div key={k}>
              <div style={{fontSize:10,color:B.textMuted,fontWeight:600,textTransform:"uppercase",fontFamily:FF,marginBottom:4,letterSpacing:"0.06em"}}>{l}</div>
              <div style={{display:"flex",gap:SP.sm,alignItems:"center"}}>
                <div style={{width:26,height:26,borderRadius:4,background:b[k]||B.offWhite,border:`0.5px solid ${B.border}`,flexShrink:0}}/>
                <Inp value={b[k]} onChange={ub(k)} placeholder="#000000"/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:SP.md}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:SP.sm}}>
          <Lbl c="Terminology Rules"/>
          <Btn onClick={()=>setCfg(c=>({...c,branding:{...c.branding,terminology:[...c.branding.terminology,{id:uid(),use:"",not:""}]}}))} v="blue">+ Add Rule</Btn>
        </div>
        {b.terminology.length===0&&<div style={{border:`0.5px dashed ${B.border}`,borderRadius:6,padding:"10px",textAlign:"center",color:B.textMuted,fontSize:12,fontFamily:FF}}>No terminology rules yet</div>}
        {b.terminology.map(t=>(
          <div key={t.id} style={{display:"grid",gridTemplateColumns:"1fr auto 1fr auto",gap:SP.sm,alignItems:"center",marginBottom:SP.sm}}>
            <Inp value={t.use} onChange={v=>setCfg(c=>({...c,branding:{...c.branding,terminology:c.branding.terminology.map(x=>x.id===t.id?{...x,use:v}:x)}}))} placeholder='Use this'/>
            <span style={{color:B.textMuted,fontSize:13,fontWeight:600}}>→</span>
            <Inp value={t.not} onChange={v=>setCfg(c=>({...c,branding:{...c.branding,terminology:c.branding.terminology.map(x=>x.id===t.id?{...x,not:v}:x)}}))} placeholder='Not this'/>
            <button onClick={()=>setCfg(c=>({...c,branding:{...c.branding,terminology:c.branding.terminology.filter(x=>x.id!==t.id)}}))} style={{width:30,height:30,border:`0.5px solid ${B.dangerBorder}`,borderRadius:6,background:"transparent",color:B.danger,cursor:"pointer",fontSize:14}}>×</button>
          </div>
        ))}
      </div>
    </Card>
    <Card title="Prior Report — Tone Calibration">
      <div style={{display:"flex",gap:SP.sm,marginBottom:SP.md}}>
        {[["continuing","📋 Continuing fund","Upload prior report for tone calibration"],["new","✨ New format","Use section builder to define structure"]].map(([val,t,s])=>(
          <button key={val} onClick={()=>u("reportMode")(val)} style={{flex:1,padding:"10px 12px",textAlign:"left",cursor:"pointer",borderRadius:6,
            border:`0.5px solid ${cfg.reportMode===val?B.navy:B.border}`,
            background:cfg.reportMode===val?B.navy:"transparent",
            color:cfg.reportMode===val?B.white:B.textSecondary,fontFamily:FF,fontSize:12}}>
            <div style={{fontWeight:700,marginBottom:2}}>{t}</div>
            <div style={{fontSize:11,opacity:0.75}}>{s}</div>
          </button>
        ))}
      </div>
      {cfg.reportMode!=="new"
        ?<div>
          <DZ file={cfg.priorReport} onFile={u("priorReport")} label="Upload prior quarterly report" opt/>
          <div style={{marginTop:SP.sm,display:"flex",gap:SP.sm,alignItems:"flex-start",padding:"8px 12px",background:B.warningBg,border:`0.5px solid ${B.warningBorder}`,borderRadius:6}}>
            <span style={{fontSize:13,flexShrink:0,marginTop:1}}>⚠</span>
            <div style={{fontSize:11,color:B.warning,fontFamily:FF,lineHeight:1.6}}>
              <span style={{fontWeight:700}}>Sensitive document.</span> Prior reports may contain confidential investor, financial or portfolio data. Do not upload without confirming this is permitted under your fund's data handling policy. Seek manager approval if applicable.
            </div>
          </div>
        </div>
        :<div style={{background:B.warningBg,border:`0.5px solid ${B.warningBorder}`,borderRadius:6,padding:"9px 12px",fontSize:12,color:B.warning,fontFamily:FF}}>No prior report — AI relies on tone and branding settings.</div>}
    </Card>
    <div style={{display:"flex",justifyContent:"flex-end"}}>
      <Btn onClick={onNext} disabled={!valid} v="primary" sz="lg">Continue to Data Intake →</Btn>
    </div>
  </div>;
}

// ─── MINI BAR CHART ───────────────────────────────────────────────────────────
function MiniBar({data,color,height=60,label}){
  const c=color||B.terracotta;
  if(!data||data.length===0) return null;
  const vals=data.map(d=>parseFloat(d.value)||0);
  const max=Math.max(...vals,0.001);
  const w=100/data.length;
  return <div>
    {label&&<div style={{fontSize:10,color:B.textMuted,fontFamily:FF,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{label}</div>}
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{width:"100%",height,display:"block"}}>
      {data.map((d,i)=>{
        const h=vals[i]/max*(height-14);
        const x=i*w+w*0.1; const bw=w*0.8;
        return <g key={i}>
          <rect x={x} y={height-h-14} width={bw} height={h} fill={c} rx="1" opacity="0.8"/>
          <text x={x+bw/2} y={height-2} textAnchor="middle" fontSize="6" fill={B.textMuted} fontFamily={FF}>{d.label}</text>
          <text x={x+bw/2} y={height-h-16} textAnchor="middle" fontSize="6.5" fill={c} fontFamily={FF} fontWeight="600">{d.value}</text>
        </g>;
      })}
    </svg>
  </div>;
}

// ─── FINANCIALS TAB ───────────────────────────────────────────────────────────
function FinancialsTab({fin,setFin,assets,debt}){
  const u=k=>v=>setFin(f=>({...f,[k]:parseFloat(v)||0}));
  const tFV=assets.reduce((s,a)=>s+a.fairValue,0);
  const tDebt=debt.reduce((s,d)=>s+d.outstanding,0);
  const closingGAV=tFV;
  const closingNAV=closingGAV - tDebt - (fin.liabilities||0);
  const navMovement=(fin.valuationMovement||0)+(fin.incomeAccrued||0)+(fin.feesExpenses||0)+(fin.distributions||0)+(fin.otherMovements||0);

  const bridgeRows=[
    {label:"Opening NAV (prior period)",  value:fin.priorNav,         highlight:false, indent:false},
    {label:"Valuation movement",           value:fin.valuationMovement, highlight:false, indent:true,  signed:true},
    {label:"Income accrued",               value:fin.incomeAccrued,    highlight:false, indent:true,  signed:true},
    {label:"Management fees & expenses",   value:fin.feesExpenses,     highlight:false, indent:true,  signed:true},
    {label:"Distributions paid",           value:fin.distributions,    highlight:false, indent:true,  signed:true},
    {label:"Other movements",              value:fin.otherMovements,   highlight:false, indent:true,  signed:true},
    {label:"Closing NAV",                  value:closingNAV,           highlight:true,  indent:false},
    {label:"Total Debt",                   value:-tDebt,               highlight:false, indent:true,  signed:true},
    {label:"Other Liabilities",            value:-fin.liabilities,     highlight:false, indent:true,  signed:true},
    {label:"Gross Asset Value (GAV)",      value:closingGAV,           highlight:true,  indent:false},
  ];

  const navRet=fin.priorNav>0?((navMovement/fin.priorNav)*100).toFixed(1):"-";
  const blendedLtv=tFV>0?((tDebt/tFV)*100).toFixed(1):"-";
  const navPerUnit=fin.shareClasses?.[0]?.units>0?(closingNAV/(fin.shareClasses[0].units/1000)).toFixed(2):"-";

  return <div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:SP.lg}}>
      <div>
        <Card title="NAV Bridge Inputs" sub="Enter prior period figures. GAV and debt are pulled from the asset and debt tables automatically.">
          {[
            {k:"priorNav",        l:"Opening NAV (prior period) €m"},
            {k:"valuationMovement",l:"Valuation movement €m"},
            {k:"incomeAccrued",   l:"Income accrued (net) €m"},
            {k:"feesExpenses",    l:"Mgmt fees & expenses €m (enter negative)"},
            {k:"distributions",   l:"Distributions paid €m (enter negative)"},
            {k:"otherMovements",  l:"Other movements €m"},
            {k:"liabilities",     l:"Other liabilities €m"},
          ].map(({k,l})=>(
            <div key={k} style={{marginBottom:SP.md}}>
              <Lbl c={l}/>
              <Inp value={fin[k]??""} onChange={u(k)} placeholder="0.00" st={{fontSize:13}}/>
            </div>
          ))}
        </Card>
      </div>
      <div>
        <Card title="NAV Bridge — Live Preview" sub="Computed from your inputs and asset table. This is what will appear in the report.">
          <table style={{width:"100%",borderCollapse:"collapse",fontFamily:FF}}>
            <tbody>
              {bridgeRows.map((r,i)=>(
                <tr key={i} style={{background:r.highlight?B.offWhite:"transparent",borderBottom:`0.5px solid ${B.border}`}}>
                  <td style={{padding:"7px 10px",fontSize:12,color:r.indent?B.textSecondary:B.textPrimary,fontWeight:r.highlight?700:400,paddingLeft:r.indent?22:10}}>{r.label}</td>
                  <td style={{padding:"7px 10px",fontSize:12,fontWeight:r.highlight?700:400,textAlign:"right",color:r.highlight?B.terracotta:(r.value||0)<0?B.danger:B.success}}>
                    {r.value===undefined||r.value===null||r.value===""?"—":`€${Number(r.value).toFixed(1)}m`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:SP.sm,marginTop:SP.md}}>
            {[{l:"NAV Return",v:`${navRet}%`},{l:"Blended LTV",v:`${blendedLtv}%`},{l:"NAV / Unit (÷1000)",v:`€${navPerUnit}`}].map(k=>(
              <div key={k.l} style={{background:B.offWhite,borderRadius:6,padding:"10px 12px",textAlign:"center",border:`0.5px solid ${B.border}`}}>
                <div style={{fontSize:10,color:B.textMuted,fontFamily:FF,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{k.l}</div>
                <div style={{fontSize:15,fontWeight:700,color:B.terracotta,fontFamily:FF}}>{k.v}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Share Classes — NAV Allocation" sub="Units outstanding per class for per-unit NAV calculation.">
          {(fin.shareClasses||[]).map((sc,i)=>(
            <div key={sc.id} style={{display:"grid",gridTemplateColumns:"1fr 130px 32px",gap:SP.sm,marginBottom:SP.sm,alignItems:"end"}}>
              <div><Lbl c={i===0?"Class Name":""}/><Inp value={sc.name} onChange={v=>setFin(f=>({...f,shareClasses:f.shareClasses.map(x=>x.id===sc.id?{...x,name:v}:x)}))} placeholder="Class A — Institutional EUR"/></div>
              <div><Lbl c={i===0?"Units o/s":""}/><Inp value={sc.units} onChange={v=>setFin(f=>({...f,shareClasses:f.shareClasses.map(x=>x.id===sc.id?{...x,units:parseInt(v)||0}:x)}))} placeholder="58200" st={{fontSize:12}}/></div>
              <div style={{display:"flex",alignItems:"flex-end",paddingBottom:1}}>
                <button onClick={()=>setFin(f=>({...f,shareClasses:f.shareClasses.filter(x=>x.id!==sc.id)}))} style={{width:28,height:32,border:`0.5px solid ${B.dangerBorder}`,borderRadius:6,background:"transparent",color:B.danger,cursor:"pointer",fontSize:13}}>×</button>
              </div>
            </div>
          ))}
          <Btn onClick={()=>setFin(f=>({...f,shareClasses:[...(f.shareClasses||[]),{id:uid(),name:"",units:0,currency:"EUR"}]}))} v="ghost">+ Add Class</Btn>
        </Card>
      </div>
    </div>
  </div>;
}

// ─── CSV TEMPLATE DEFINITIONS ────────────────────────────────────────────────
const ASSET_TEMPLATE_COLS = ["name","country","type","area","bookValue","fairValue","occupancy","walb","tenants"];
const DEBT_TEMPLATE_COLS  = ["assetRef","lender","outstanding","ltv","margin","maturity","covenantLtv","covenantDscr","hedged"];
const MKT_TEMPLATE_COLS   = ["geo","src","pub","date","primeYield","vacancy","rentalGrowth","investActivity","occupierDemand","notes"];
const FIN_TEMPLATE_COLS   = ["priorNav","valuationMovement","incomeAccrued","feesExpenses","distributions","otherMovements","liabilities"];

function downloadCSV(filename, cols, rows=[]) {
  const header = cols.join(",");
  const body   = rows.map(r => cols.map(c => `"${(r[c]??"")}"`).join(",")).join("\n");
  const blob   = new Blob([header + (body ? "\n"+body : "")], {type:"text/csv"});
  const a      = document.createElement("a");
  a.href       = URL.createObjectURL(blob);
  a.download   = filename;
  a.click();
}

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g,"").trim());
  return lines.slice(1).map(line => {
    const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,)|^(?=,)|(?<=,)$)/g) || [];
    const obj  = {};
    headers.forEach((h,i) => { obj[h] = (vals[i]||"").replace(/^"|"$/g,"").trim(); });
    return obj;
  });
}

// ─── AI FIELD MAPPING (DEMO) ──────────────────────────────────────────────────
// Maps arbitrary column names → asset schema keys
const AI_FIELD_MAP = {
  // name
  "asset name":"name","property name":"name","asset":"name","property":"name","building":"name",
  // country
  "country":"country","location":"country","market":"country","geography":"country",
  // type
  "type":"type","asset type":"type","property type":"type","sector":"type",
  // area
  "area":"area","gla":"area","gla (sqm)":"area","gross leasable area":"area","size":"area","sqm":"area","floor area":"area",
  // bookValue
  "book value":"bookValue","bv":"bookValue","bv (€m)":"bookValue","cost":"bookValue","acquisition cost":"bookValue","purchase price":"bookValue",
  // fairValue
  "fair value":"fairValue","fv":"fairValue","fv (€m)":"fairValue","valuation":"fairValue","appraised value":"fairValue","market value":"fairValue",
  // occupancy
  "occupancy":"occupancy","occ":"occupancy","occ%":"occupancy","occupancy rate":"occupancy","occupancy %":"occupancy","leased %":"occupancy",
  // walb
  "walb":"walb","wault":"walb","walb (years)":"walb","weighted avg lease break":"walb","lease expiry":"walb",
  // tenants
  "tenants":"tenants","tenant":"tenants","key tenants":"tenants","occupiers":"tenants","tenant name":"tenants",
};

function aiMapRow(rawRow) {
  const mapped  = {};
  const missing = [];
  const unmapped = [];

  ASSET_TEMPLATE_COLS.forEach(col => {
    // try direct match first, then normalised
    let found = false;
    for (const [rawKey, val] of Object.entries(rawRow)) {
      const norm = rawKey.toLowerCase().trim();
      if (norm === col || AI_FIELD_MAP[norm] === col) {
        mapped[col] = val;
        found = true;
        break;
      }
    }
    if (!found) missing.push(col);
  });

  // flag raw keys that couldn't be mapped at all
  Object.keys(rawRow).forEach(k => {
    const norm = k.toLowerCase().trim();
    if (!AI_FIELD_MAP[norm] && !ASSET_TEMPLATE_COLS.includes(norm)) {
      unmapped.push(k);
    }
  });

  return { mapped, missing, unmapped };
}

// ─── TEMPLATE DOWNLOAD MODAL ─────────────────────────────────────────────────
function TemplateModal({ onClose }) {
  const templates = [
    { label:"Assets",     desc:"Core asset table — name, country, type, GLA, valuations, occupancy, WALB, tenants", cols:ASSET_TEMPLATE_COLS, file:"template_assets.csv" },
    { label:"Debt",       desc:"Debt schedule per asset — lender, outstanding, LTV, margin, maturity, covenants",    cols:DEBT_TEMPLATE_COLS,  file:"template_debt.csv"   },
    { label:"Market",     desc:"Market data by geography — yields, vacancy, rental growth, occupier demand",          cols:MKT_TEMPLATE_COLS,   file:"template_market.csv" },
    { label:"Financials", desc:"NAV bridge inputs — prior NAV, valuation movement, income, fees, distributions",      cols:FIN_TEMPLATE_COLS,   file:"template_financials.csv" },
  ];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,39,68,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000}}>
      <div style={{background:B.white,borderRadius:12,padding:"28px 32px",maxWidth:520,width:"90%",border:`0.5px solid ${B.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:SP.lg}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:B.navy,fontFamily:FF}}>Download Template</div>
            <div style={{fontSize:12,color:B.textMuted,fontFamily:FF,marginTop:3}}>Choose which dataset template to download</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:B.textMuted,cursor:"pointer",fontSize:18,lineHeight:1,padding:2}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:SP.sm}}>
          {templates.map(t => (
            <div key={t.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",border:`0.5px solid ${B.border}`,borderRadius:8,background:B.offWhite}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:B.textPrimary,fontFamily:FF}}>{t.label}</div>
                <div style={{fontSize:11,color:B.textMuted,fontFamily:FF,marginTop:2,maxWidth:340}}>{t.desc}</div>
              </div>
              <button
                onClick={()=>downloadCSV(t.file, t.cols)}
                style={{flexShrink:0,marginLeft:SP.md,padding:"6px 14px",fontSize:11,fontWeight:600,fontFamily:FF,
                  border:`0.5px solid ${B.navy}`,borderRadius:6,background:"transparent",color:B.navy,cursor:"pointer",whiteSpace:"nowrap"}}
                onMouseEnter={e=>{e.currentTarget.style.background=B.navy;e.currentTarget.style.color=B.white;}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=B.navy;}}
              >↓ Download</button>
            </div>
          ))}
        </div>
        <div style={{marginTop:SP.lg,textAlign:"right"}}>
          <Btn onClick={onClose} v="ghost">Close</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── CSV UPLOAD PANEL (per asset row) ────────────────────────────────────────
function CsvUploadPanel({ asset, onApply, onClose }) {
  const fileRef = useRef();
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [error,   setError]   = useState("");
  const [showTpl, setShowTpl] = useState(false);

  const handleFile = f => {
    setFile(f); setError(""); setPreview(null);
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const rows = parseCSV(e.target.result);
        if (!rows.length) { setError("No data rows found in file."); return; }
        setPreview(rows[0]); // show first row as preview
      } catch(_) { setError("Could not parse file. Ensure it is a valid CSV."); }
    };
    reader.readAsText(f);
  };

  const handleApply = () => {
    if (!preview) return;
    const num = k => parseFloat(preview[k]) || 0;
    onApply({
      name:       preview.name       || asset.name,
      country:    preview.country    || asset.country,
      type:       preview.type       || asset.type,
      area:       num("area")        || asset.area,
      bookValue:  num("bookValue")   || asset.bookValue,
      fairValue:  num("fairValue")   || asset.fairValue,
      occupancy:  num("occupancy")   || asset.occupancy,
      walb:       num("walb")        || asset.walb,
      tenants:    preview.tenants    || asset.tenants,
    });
    onClose();
  };

  const FIELD_LABELS = {name:"Asset Name",country:"Country",type:"Type",area:"GLA (sqm)",bookValue:"Book Value €m",fairValue:"Fair Value €m",occupancy:"Occupancy %",walb:"WALB (yrs)",tenants:"Tenants"};

  return (
    <div style={{padding:"14px 16px",background:B.offWhite,borderRadius:8,border:`0.5px solid ${B.border}`,marginTop:SP.sm}}>
      {showTpl && <TemplateModal onClose={()=>setShowTpl(false)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:SP.md}}>
        <div style={{fontSize:12,fontWeight:700,color:B.textPrimary,fontFamily:FF}}>Upload CSV — {asset.name||"Unnamed Asset"}</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:B.textMuted,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
      </div>
      <div style={{display:"flex",gap:SP.sm,marginBottom:SP.md}}>
        <button
          onClick={()=>setShowTpl(true)}
          style={{padding:"6px 12px",fontSize:11,fontWeight:600,fontFamily:FF,border:`0.5px solid ${B.navy}`,borderRadius:6,background:"transparent",color:B.navy,cursor:"pointer"}}
          onMouseEnter={e=>{e.currentTarget.style.background=B.navy;e.currentTarget.style.color=B.white;}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=B.navy;}}
        >↓ Download Template</button>
        <button
          onClick={()=>fileRef.current.click()}
          style={{padding:"6px 12px",fontSize:11,fontWeight:600,fontFamily:FF,border:`0.5px solid ${B.border}`,borderRadius:6,background:B.white,color:B.textSecondary,cursor:"pointer"}}
        >↑ {file ? file.name : "Choose CSV file"}</button>
        <input ref={fileRef} type="file" accept=".csv" style={{display:"none"}} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
      </div>
      {error && <div style={{fontSize:12,color:B.danger,fontFamily:FF,marginBottom:SP.sm}}>{error}</div>}
      {preview && (
        <div>
          <div style={{fontSize:11,fontWeight:600,color:B.textSecondary,fontFamily:FF,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:SP.sm}}>Preview — first row</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:`${SP.xs}px ${SP.sm}px`,marginBottom:SP.md}}>
            {ASSET_TEMPLATE_COLS.map(col => {
              const val = preview[col];
              const empty = !val || val === "";
              return (
                <div key={col} style={{padding:"6px 8px",borderRadius:6,background:empty?B.warningBg:B.white,border:`0.5px solid ${empty?B.warningBorder:B.border}`}}>
                  <div style={{fontSize:9,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",color:empty?B.warning:B.textMuted,fontFamily:FF,marginBottom:2}}>{FIELD_LABELS[col]}</div>
                  <div style={{fontSize:11,color:empty?B.warning:B.textPrimary,fontFamily:FF,fontWeight:empty?600:400}}>{empty?"Missing":val}</div>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:SP.sm,justifyContent:"flex-end"}}>
            <Btn onClick={onClose} v="ghost">Cancel</Btn>
            <Btn onClick={handleApply} v="primary">Apply to Asset →</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI UPLOAD MODAL — multi-file, per-file destination tagging ──────────────
const AI_DEMO_DELAY = 1400;

const AI_DESTINATIONS = [
  { id:"assets",  label:"Assets",             desc:"Valuations, GLA, occupancy, WALB, tenants" },
  { id:"debt",    label:"Debt",               desc:"Lender, LTV, margin, maturity, covenants"  },
  { id:"updates", label:"Asset Updates",      desc:"Analyst notes, event tags"                 },
  { id:"market",  label:"Market Context",     desc:"Yields, vacancy, rental growth by geo"     },
  { id:"fin",     label:"Financials",         desc:"NAV bridge, income, fees, distributions"   },
];

// Demo mapping results keyed by destination
function demoResultForDest(dest, assetName) {
  const R = {
    assets:  { mapped:{name:assetName,country:"France",type:"Logistics",fairValue:"31.2",occupancy:"97",walb:"5.2"}, missing:["area","bookValue","tenants"], unmapped:["MSCI Code","Valuation Date"] },
    debt:    { mapped:{lender:"Société Générale",outstanding:"16.2",ltv:"52",margin:"180",maturity:"2027-06"}, missing:["covenantLtv","covenantDscr","hedged"], unmapped:["Facility ID","Draw Date"] },
    updates: { mapped:{analystNote:"Lease renewal in progress with DHL; expect 5yr extension Q1 2025."}, missing:[], unmapped:["Internal Ref","Review Date"] },
    market:  { mapped:{geo:"France",primeYield:"4.25",vacancy:"2.1",rentalGrowth:"3.8"}, missing:["investActivity","occupierDemand"], unmapped:["Source","Publication Date"] },
    fin:     { mapped:{priorNav:"58.2",valuationMovement:"2.4",incomeAccrued:"1.8"}, missing:["feesExpenses","distributions","otherMovements","liabilities"], unmapped:["Audit Ref"] },
  };
  return R[dest] || { mapped:{}, missing:[], unmapped:[] };
}

function AiUploadModal({ asset, onApply, onClose }) {
  const dropRef = useRef();
  // files: [{ id, file, dests: Set, processing, result }]
  const [files,   setFiles]   = useState([]);
  const [step,    setStep]    = useState("stage"); // stage | processing | gaps
  const [dragging,setDragging]= useState(false);
  const [results, setResults] = useState([]); // processed results per file

  const uid2 = () => Math.random().toString(36).slice(2,8);

  const addFiles = newFiles => {
    const entries = Array.from(newFiles).map(f=>({
      id: uid2(), file:f,
      dests: new Set(["assets"]), // default destination
      processing: false, result: null,
    }));
    setFiles(prev=>[...prev,...entries]);
  };

  const removeFile = id => setFiles(prev=>prev.filter(f=>f.id!==id));

  const toggleDest = (fileId, destId) => {
    setFiles(prev=>prev.map(f=>{
      if(f.id!==fileId) return f;
      const d = new Set(f.dests);
      if(d.has(destId)) { if(d.size>1) d.delete(destId); } // must keep at least one
      else d.add(destId);
      return {...f, dests:d};
    }));
  };

  const handleProcess = () => {
    if(!files.length) return;
    setStep("processing");
    // Simulate staggered processing per file
    let done = 0;
    const results = [];
    files.forEach((f, i) => {
      setTimeout(() => {
        const fileResults = Array.from(f.dests).map(dest=>({
          dest,
          ...demoResultForDest(dest, asset.name||"Asset"),
        }));
        results.push({ fileId:f.id, fileName:f.file.name, fileResults });
        done++;
        if(done === files.length) {
          setResults(results);
          setStep("gaps");
        }
      }, AI_DEMO_DELAY * (i * 0.6 + 1));
    });
  };

  const handleConfirm = () => {
    // Merge all mapped data by destination, collect asset flags
    const assetData   = {};
    const debtData    = {};
    const updateNote  = {};
    const mktData     = {};
    const finData     = {};
    const assetFlags  = {};

    results.forEach(({fileResults}) => {
      fileResults.forEach(({dest, mapped, missing}) => {
        if(dest==="assets")  { Object.assign(assetData, mapped);  missing.forEach(k=>{assetFlags[k]=true;}); }
        if(dest==="debt")    Object.assign(debtData,  mapped);
        if(dest==="updates") Object.assign(updateNote, mapped);
        if(dest==="market")  Object.assign(mktData,   mapped);
        if(dest==="fin")     Object.assign(finData,   mapped);
      });
    });

    const num = (obj,k) => parseFloat(obj[k])||0;
    onApply(
      {
        name:      assetData.name      || asset.name,
        country:   assetData.country   || asset.country,
        type:      assetData.type      || asset.type,
        area:      num(assetData,"area")      || asset.area,
        bookValue: num(assetData,"bookValue") || asset.bookValue,
        fairValue: num(assetData,"fairValue") || asset.fairValue,
        occupancy: num(assetData,"occupancy") || asset.occupancy,
        walb:      num(assetData,"walb")      || asset.walb,
        tenants:   assetData.tenants   || asset.tenants,
      },
      assetFlags,
      { debtData, updateNote, mktData, finData }
    );
    onClose();
  };

  // Destination pill colours
  const destColor = id => ({
    assets: B.navy, debt: "#5B4FCF", updates: B.success,
    market: "#B36B00", fin: B.terracotta,
  }[id] || B.navy);

  const destBg = id => ({
    assets: B.infoBg, debt:"#EEECFB", updates:B.successBg,
    market:B.warningBg, fin:`${B.terracotta}12`,
  }[id] || B.infoBg);

  const destBorder = id => ({
    assets: B.infoBorder, debt:"#C4B5FD", updates:B.successBorder,
    market:B.warningBorder, fin:`${B.terracotta}55`,
  }[id] || B.infoBorder);

  // Total mapped / missing counts across all results
  const totalMapped  = results.reduce((n,r)=>n+r.fileResults.reduce((m,fr)=>m+Object.keys(fr.mapped).length,0),0);
  const totalMissing = results.reduce((n,r)=>n+r.fileResults.reduce((m,fr)=>m+fr.missing.length,0),0);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,39,68,0.68)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,padding:SP.base}}>
      <div style={{background:B.white,borderRadius:12,width:"100%",maxWidth:640,maxHeight:"90vh",display:"flex",flexDirection:"column",border:`0.5px solid ${B.border}`}}>

        {/* ── Header ── */}
        <div style={{padding:"22px 28px 16px",borderBottom:`0.5px solid ${B.border}`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:SP.sm,marginBottom:4}}>
                <span style={{fontSize:15,fontWeight:700,color:B.navy,fontFamily:FF}}>✦ AI Upload</span>
                <span style={{fontSize:9,fontWeight:700,background:B.warningBg,color:B.warning,border:`0.5px solid ${B.warningBorder}`,padding:"2px 6px",borderRadius:4,letterSpacing:"0.07em",fontFamily:FF}}>DEMO</span>
              </div>
              <div style={{fontSize:12,color:B.textMuted,fontFamily:FF}}>Upload multiple files — assign each to one or more data destinations. Claude maps fields automatically.</div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:B.textMuted,cursor:"pointer",fontSize:18,lineHeight:1,padding:2,marginLeft:SP.md,flexShrink:0}}>×</button>
          </div>
          <div style={{marginTop:SP.sm,padding:"5px 10px",background:B.offWhite,borderRadius:6,border:`0.5px solid ${B.border}`,display:"inline-block"}}>
            <span style={{fontSize:11,color:B.textSecondary,fontFamily:FF}}>Asset: </span>
            <span style={{fontSize:11,fontWeight:700,color:B.navy,fontFamily:FF}}>{asset.name||"Unnamed"}</span>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{flex:1,overflowY:"auto",padding:"20px 28px"}}>

          {/* ── STAGE: file staging ── */}
          {step==="stage"&&<>
            {/* Drop zone */}
            <div
              onDragOver={e=>{e.preventDefault();setDragging(true);}}
              onDragLeave={()=>setDragging(false)}
              onDrop={e=>{e.preventDefault();setDragging(false);addFiles(e.dataTransfer.files);}}
              onClick={()=>dropRef.current.click()}
              style={{border:`1.5px dashed ${dragging?B.terracotta:B.borderDark}`,borderRadius:10,padding:"24px 20px",textAlign:"center",cursor:"pointer",
                background:dragging?`${B.terracotta}08`:B.offWhite,marginBottom:SP.lg,transition:"all 0.1s"}}
            >
              <input ref={dropRef} type="file" multiple accept=".csv,.xlsx,.xls,.pdf" style={{display:"none"}}
                onChange={e=>addFiles(e.target.files)}/>
              <div style={{fontSize:20,color:B.textMuted,marginBottom:SP.sm}}>↑</div>
              <div style={{fontSize:13,fontWeight:600,color:B.textSecondary,fontFamily:FF,marginBottom:4}}>Drop files here or click to browse</div>
              <div style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>CSV, Excel or PDF — add as many as needed</div>
            </div>

            {/* File list */}
            {files.length===0&&(
              <div style={{textAlign:"center",padding:`${SP.xl}px 0`,color:B.textMuted,fontSize:12,fontFamily:FF}}>No files added yet.</div>
            )}
            {files.map(f=>(
              <div key={f.id} style={{border:`0.5px solid ${B.border}`,borderRadius:10,padding:"14px 16px",marginBottom:SP.sm,background:B.white}}>
                {/* File name row */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:SP.md}}>
                  <div style={{display:"flex",alignItems:"center",gap:SP.sm}}>
                    <span style={{fontSize:15}}>{f.file.name.endsWith(".pdf")?"📄":"📊"}</span>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:B.textPrimary,fontFamily:FF}}>{f.file.name}</div>
                      <div style={{fontSize:10,color:B.textMuted,fontFamily:FF}}>{(f.file.size/1024).toFixed(0)} KB · {f.file.name.split(".").pop().toUpperCase()}</div>
                    </div>
                  </div>
                  <button onClick={()=>removeFile(f.id)} style={{background:"none",border:"none",color:B.textMuted,cursor:"pointer",fontSize:16,lineHeight:1,padding:2}}
                    onMouseEnter={e=>e.currentTarget.style.color=B.danger}
                    onMouseLeave={e=>e.currentTarget.style.color=B.textMuted}>×</button>
                </div>

                {/* Destination selector */}
                <div>
                  <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:B.textMuted,fontFamily:FF,marginBottom:SP.sm}}>
                    Map this file to:
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:SP.sm}}>
                    {AI_DESTINATIONS.map(dest=>{
                      const active = f.dests.has(dest.id);
                      return (
                        <button key={dest.id} onClick={()=>toggleDest(f.id,dest.id)}
                          title={dest.desc}
                          style={{padding:"4px 12px",fontSize:11,fontWeight:600,fontFamily:FF,borderRadius:20,cursor:"pointer",transition:"all 0.1s",
                            border:`0.5px solid ${active?destBorder(dest.id):B.border}`,
                            background:active?destBg(dest.id):"transparent",
                            color:active?destColor(dest.id):B.textMuted}}>
                          {dest.label}
                          {active&&<span style={{marginLeft:4,opacity:0.7}}>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{marginTop:SP.xs,fontSize:10,color:B.textMuted,fontFamily:FF}}>
                    {Array.from(f.dests).map(d=>AI_DESTINATIONS.find(x=>x.id===d)?.desc).join(" · ")}
                  </div>
                </div>
              </div>
            ))}
          </>}

          {/* ── PROCESSING ── */}
          {step==="processing"&&(
            <div style={{textAlign:"center",padding:`${SP.xl}px 0`}}>
              <div style={{fontSize:26,marginBottom:SP.md,display:"inline-block",
                animation:"spin 1s linear infinite"}}>⟳</div>
              <div style={{fontSize:14,fontWeight:600,color:B.navy,fontFamily:FF,marginBottom:SP.sm}}>Mapping {files.length} file{files.length!==1?"s":""}…</div>
              <div style={{display:"flex",flexDirection:"column",gap:SP.sm,maxWidth:300,margin:"0 auto",marginTop:SP.lg}}>
                {files.map((f,i)=>(
                  <div key={f.id} style={{display:"flex",alignItems:"center",gap:SP.sm,padding:"7px 12px",borderRadius:8,background:B.offWhite,border:`0.5px solid ${B.border}`}}>
                    <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${B.terracotta}`,borderTopColor:"transparent",
                      animation:`spin ${0.8+i*0.15}s linear infinite`,flexShrink:0}}/>
                    <span style={{fontSize:11,color:B.textSecondary,fontFamily:FF,flex:1,textAlign:"left"}}>{f.file.name}</span>
                    <span style={{fontSize:9,color:B.textMuted,fontFamily:FF}}>
                      {Array.from(f.dests).map(d=>AI_DESTINATIONS.find(x=>x.id===d)?.label).join(", ")}
                    </span>
                  </div>
                ))}
              </div>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* ── GAPS SUMMARY ── */}
          {step==="gaps"&&results.length>0&&(
            <div>
              {/* Overall summary pills */}
              <div style={{display:"flex",gap:SP.sm,marginBottom:SP.lg,flexWrap:"wrap"}}>
                <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:B.successBg,color:B.success,border:`0.5px solid ${B.successBorder}`,fontFamily:FF}}>
                  {totalMapped} field{totalMapped!==1?"s":""} mapped
                </span>
                {totalMissing>0&&<span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:B.warningBg,color:B.warning,border:`0.5px solid ${B.warningBorder}`,fontFamily:FF}}>
                  {totalMissing} field{totalMissing!==1?"s":""} missing
                </span>}
                <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:B.offWhite,color:B.textSecondary,border:`0.5px solid ${B.border}`,fontFamily:FF}}>
                  {files.length} file{files.length!==1?"s":""} processed
                </span>
              </div>

              {/* Per-file, per-destination breakdown */}
              {results.map(({fileId,fileName,fileResults})=>(
                <div key={fileId} style={{marginBottom:SP.md,border:`0.5px solid ${B.border}`,borderRadius:10,overflow:"hidden"}}>
                  {/* File header */}
                  <div style={{padding:"10px 14px",background:B.offWhite,borderBottom:`0.5px solid ${B.border}`,display:"flex",alignItems:"center",gap:SP.sm}}>
                    <span style={{fontSize:13}}>{fileName.endsWith(".pdf")?"📄":"📊"}</span>
                    <span style={{fontSize:12,fontWeight:600,color:B.textPrimary,fontFamily:FF}}>{fileName}</span>
                  </div>

                  {fileResults.map(({dest,mapped,missing,unmapped})=>{
                    const destInfo = AI_DESTINATIONS.find(d=>d.id===dest);
                    const mCount   = Object.keys(mapped).length;
                    const xCount   = missing.length;
                    return (
                      <div key={dest} style={{padding:"12px 14px",borderBottom:`0.5px solid ${B.border}`}}>
                        {/* Destination label + counts */}
                        <div style={{display:"flex",alignItems:"center",gap:SP.sm,marginBottom:SP.sm}}>
                          <span style={{fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20,fontFamily:FF,
                            background:destBg(dest),color:destColor(dest),border:`0.5px solid ${destBorder(dest)}`}}>
                            {destInfo?.label}
                          </span>
                          <span style={{fontSize:10,color:B.success,fontFamily:FF}}>✓ {mCount} mapped</span>
                          {xCount>0&&<span style={{fontSize:10,color:B.warning,fontFamily:FF}}>⚠ {xCount} missing</span>}
                        </div>

                        {/* Mapped fields */}
                        {mCount>0&&(
                          <div style={{display:"flex",flexWrap:"wrap",gap:SP.xs,marginBottom:xCount>0?SP.xs:0}}>
                            {Object.entries(mapped).map(([k,v])=>(
                              <div key={k} style={{padding:"3px 8px",borderRadius:5,background:B.successBg,border:`0.5px solid ${B.successBorder}`}}>
                                <span style={{fontSize:9,color:B.success,fontFamily:FF,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>{k}: </span>
                                <span style={{fontSize:10,color:B.textPrimary,fontFamily:FF}}>{String(v).slice(0,30)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Missing fields */}
                        {xCount>0&&(
                          <div style={{display:"flex",flexWrap:"wrap",gap:SP.xs,marginTop:SP.xs}}>
                            {missing.map(k=>(
                              <div key={k} style={{padding:"3px 8px",borderRadius:5,background:B.warningBg,border:`0.5px solid ${B.warningBorder}`}}>
                                <span style={{fontSize:10,color:B.warning,fontFamily:FF}}>{k}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Unrecognised */}
                        {unmapped?.length>0&&(
                          <div style={{marginTop:SP.xs,fontSize:10,color:B.textMuted,fontFamily:FF}}>
                            Ignored: {unmapped.join(" · ")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {totalMissing>0&&(
                <div style={{padding:"9px 12px",background:B.warningBg,borderRadius:8,border:`0.5px solid ${B.warningBorder}`}}>
                  <div style={{fontSize:12,color:B.warning,fontFamily:FF,lineHeight:1.5}}>
                    <span style={{fontWeight:700}}>Missing fields will be flagged inline</span> on the asset row. You can fill them in manually after confirming.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{padding:"14px 28px",borderTop:`0.5px solid ${B.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0,background:B.white}}>
          <div style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>
            {step==="stage"&&`${files.length} file${files.length!==1?"s":""} staged`}
            {step==="processing"&&"Processing…"}
            {step==="gaps"&&`${files.length} file${files.length!==1?"s":""} ready to apply`}
          </div>
          <div style={{display:"flex",gap:SP.sm}}>
            <Btn onClick={onClose} v="ghost">Cancel</Btn>
            {step==="stage"&&<Btn onClick={handleProcess} disabled={!files.length} v="primary">Process Files →</Btn>}
            {step==="gaps"&&<Btn onClick={handleConfirm} v="primary">Confirm & Apply →</Btn>}
          </div>
        </div>

      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2
// ═══════════════════════════════════════════════════════════════════════════════
function Step2({assets,setAssets,debt,setDebt,notes,setNotes,mkt,setMkt,fin,setFin,onBack,onNext}){
  const [tab,setTab]=useState("assets");
  const [csvOpen,setCsvOpen]=useState(null);
  const [aiOpen,setAiOpen]=useState(null);
  const [aiFlags,setAiFlags]=useState({});

  const ua=(id,k,v)=>setAssets(a=>a.map(x=>x.id===id?{...x,[k]:v}:x));
  const ud=(id,k,v)=>setDebt(d=>d.map(x=>x.id===id?{...x,[k]:v}:x));
  const addA=()=>{const a=mkA();setAssets(p=>[...p,a]);setDebt(p=>[...p,mkD(a.name)]);setNotes(n=>({...n,[a.id]:""}));};
  const remA=id=>{const a=assets.find(x=>x.id===id);setAssets(p=>p.filter(x=>x.id!==id));setDebt(d=>d.filter(x=>x.assetRef!==a?.name));setNotes(n=>{const c={...n};delete c[id];return c;});};
  const tFV=assets.reduce((s,a)=>s+a.fairValue,0); const tBV=assets.reduce((s,a)=>s+a.bookValue,0); const tD=debt.reduce((s,d)=>s+d.outstanding,0);

  const applyUpload=(id,data)=>setAssets(prev=>prev.map(x=>x.id===id?{...x,...data}:x));
  const applyAiUpload=(id,data,flags)=>{
    setAssets(prev=>prev.map(x=>x.id===id?{...x,...data}:x));
    if(flags&&Object.keys(flags).length>0) setAiFlags(prev=>({...prev,[id]:flags}));
  };

  const th={padding:"7px 10px",fontSize:11,fontWeight:600,color:B.textSecondary,textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:FF,textAlign:"left",borderBottom:`0.5px solid ${B.border}`,background:B.offWhite,whiteSpace:"nowrap"};
  const td={padding:"4px 10px",borderBottom:`0.5px solid ${B.border}`,verticalAlign:"middle"};

  return <div>
    {/* KPI bar — metric cards with terracotta values */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:SP.md,marginBottom:SP.lg}}>
      {[
        {l:"GAV",v:fmtM(tFV),s:`BV ${fmtM(tBV)}`},
        {l:"Debt",v:fmtM(tD),s:`LTV ~${tFV?((tD/tFV)*100).toFixed(0):0}%`},
        {l:"Avg Occ",v:`${assets.length?(assets.reduce((s,a)=>s+a.occupancy,0)/assets.length).toFixed(1):0}%`,s:`${assets.length} assets`},
        {l:"Unrealised",v:fmtM(tFV-tBV),s:`${tBV?(((tFV-tBV)/tBV)*100).toFixed(1):0}% vs BV`},
      ].map(k=>(
        <div key={k.l} style={{background:B.offWhite,borderRadius:8,padding:"12px 14px",border:`0.5px solid ${B.border}`,borderLeft:`3px solid ${B.terracotta}`}}>
          <div style={{fontSize:10,color:B.textMuted,fontFamily:FF,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{k.l}</div>
          <div style={{fontSize:16,fontWeight:700,color:B.terracotta,fontFamily:FF}}>{k.v}</div>
          <div style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>{k.s}</div>
        </div>
      ))}
    </div>

    {/* Tab bar */}
    <div style={{display:"flex",borderBottom:`0.5px solid ${B.border}`,marginBottom:SP.md,justifyContent:"space-between",alignItems:"flex-end"}}>
      <div style={{display:"flex"}}>
        {["assets","debt","updates","market","financials"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 16px",fontSize:12,fontFamily:FF,fontWeight:tab===t?700:400,border:"none",
            borderBottom:tab===t?`2px solid ${B.terracotta}`:"2px solid transparent",
            background:"transparent",color:tab===t?B.terracotta:B.textSecondary,cursor:"pointer",marginBottom:-1}}>
            {t==="updates"?"Asset Updates":t==="market"?"Market Context":t==="financials"?"Financials":t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      {["assets","debt","updates"].includes(tab)&&
        <button onClick={addA} style={{marginBottom:SP.sm,padding:`${SP.sm-2}px ${SP.md}px`,fontSize:12,fontFamily:FF,fontWeight:600,
          border:`0.5px solid ${B.navy}`,borderRadius:6,background:"transparent",color:B.navy,cursor:"pointer"}}>
          + Add Asset
        </button>}
    </div>

    {tab==="assets"&&<div style={{overflowX:"auto"}}>
      {/* AI Upload Modal */}
      {aiOpen&&(()=>{const a=assets.find(x=>x.id===aiOpen);return a?<AiUploadModal asset={a} onApply={(data,flags,_extra)=>applyAiUpload(a.id,data,flags)} onClose={()=>setAiOpen(null)}/>:null;})()}

      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Asset","Country","Type","GLA","BV €m","FV €m","Occ%","WALB","Tenants",""].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{assets.map(a=>{
          const flags=aiFlags[a.id]||{};
          const hasFlags=Object.keys(flags).length>0;
          return <>
            <tr key={a.id} onMouseEnter={e=>e.currentTarget.style.background=B.offWhite} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <td style={{...td,maxWidth:150}}>
                <EC value={a.name} onChange={v=>ua(a.id,"name",v)}/>
                {flags.name&&<span style={{fontSize:9,background:B.warningBg,color:B.warning,padding:"1px 4px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.warningBorder}`,marginLeft:3}}>?</span>}
              </td>
              <td style={td}>
                <EC value={a.country} onChange={v=>ua(a.id,"country",v)}/>
                {flags.country&&<span style={{fontSize:9,background:B.warningBg,color:B.warning,padding:"1px 4px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.warningBorder}`,marginLeft:3}}>?</span>}
              </td>
              <td style={td}>
                <EC value={a.type} onChange={v=>ua(a.id,"type",v)}/>
                {flags.type&&<span style={{fontSize:9,background:B.warningBg,color:B.warning,padding:"1px 4px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.warningBorder}`,marginLeft:3}}>?</span>}
              </td>
              <td style={td}>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  <EC value={a.area} onChange={v=>ua(a.id,"area",v)} type="number" align="right"/>
                  {flags.area&&<span style={{fontSize:9,background:B.warningBg,color:B.warning,padding:"1px 4px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.warningBorder}`}}>?</span>}
                </div>
              </td>
              <td style={td}>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  <EC value={a.bookValue} onChange={v=>ua(a.id,"bookValue",v)} type="number" align="right" prefix="€"/>
                  {flags.bookValue&&<span style={{fontSize:9,background:B.warningBg,color:B.warning,padding:"1px 4px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.warningBorder}`}}>?</span>}
                </div>
              </td>
              <td style={td}>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  <EC value={a.fairValue} onChange={v=>ua(a.id,"fairValue",v)} type="number" align="right" prefix="€"/>
                  {flags.fairValue&&<span style={{fontSize:9,background:B.warningBg,color:B.warning,padding:"1px 4px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.warningBorder}`}}>?</span>}
                </div>
              </td>
              <td style={td}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <EC value={a.occupancy} onChange={v=>ua(a.id,"occupancy",v)} type="number" align="right"/>
                  {flags.occupancy
                    ?<span style={{fontSize:9,background:B.warningBg,color:B.warning,padding:"1px 4px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.warningBorder}`}}>?</span>
                    :<div style={{width:26,height:3,background:B.border,borderRadius:2}}>
                      <div style={{height:"100%",borderRadius:2,width:`${Math.min(a.occupancy,100)}%`,background:a.occupancy>=95?B.success:a.occupancy>=80?"#E67E22":B.danger}}/>
                    </div>}
                </div>
              </td>
              <td style={td}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <EC value={a.walb} onChange={v=>ua(a.id,"walb",v)} type="number" align="right"/>
                  {flags.walb
                    ?<span style={{fontSize:9,background:B.warningBg,color:B.warning,padding:"1px 4px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.warningBorder}`}}>?</span>
                    :a.walb<3&&<span style={{fontSize:9,background:B.warningBg,color:B.warning,padding:"1px 4px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.warningBorder}`}}>SHORT</span>}
                </div>
              </td>
              <td style={td}>
                <EC value={a.tenants} onChange={v=>ua(a.id,"tenants",v)}/>
                {flags.tenants&&<span style={{fontSize:9,background:B.warningBg,color:B.warning,padding:"1px 4px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.warningBorder}`,marginLeft:3}}>?</span>}
              </td>
              <td style={{...td,width:90,whiteSpace:"nowrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:SP.xs}}>
                  {/* Upload CSV button */}
                  <button
                    onClick={()=>{setCsvOpen(csvOpen===a.id?null:a.id);setAiOpen(null);}}
                    title="Upload CSV"
                    style={{padding:"3px 8px",fontSize:10,fontFamily:FF,fontWeight:600,borderRadius:5,cursor:"pointer",whiteSpace:"nowrap",
                      border:`0.5px solid ${csvOpen===a.id?B.navy:B.border}`,
                      background:csvOpen===a.id?B.navy:"transparent",
                      color:csvOpen===a.id?B.white:B.textSecondary,transition:"all 0.1s"}}
                    onMouseEnter={e=>{if(csvOpen!==a.id){e.currentTarget.style.borderColor=B.navy;e.currentTarget.style.color=B.navy;}}}
                    onMouseLeave={e=>{if(csvOpen!==a.id){e.currentTarget.style.borderColor=B.border;e.currentTarget.style.color=B.textSecondary;}}}
                  >↑ CSV</button>
                  {/* AI Upload button */}
                  <button
                    onClick={()=>{setAiOpen(a.id);setCsvOpen(null);}}
                    title="AI Upload — Claude maps fields automatically"
                    style={{padding:"3px 8px",fontSize:10,fontFamily:FF,fontWeight:700,borderRadius:5,cursor:"pointer",whiteSpace:"nowrap",
                      border:`0.5px solid ${B.terracotta}`,background:`${B.terracotta}12`,color:B.terracotta,transition:"all 0.1s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=B.terracotta;e.currentTarget.style.color=B.white;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${B.terracotta}12`;e.currentTarget.style.color=B.terracotta;}}
                  >✦ AI</button>
                  {/* Delete */}
                  <button onClick={()=>remA(a.id)} style={{background:"none",border:"none",color:B.border,cursor:"pointer",fontSize:13,padding:2}}
                    onMouseEnter={e=>e.currentTarget.style.color=B.danger} onMouseLeave={e=>e.currentTarget.style.color=B.border}>×</button>
                </div>
              </td>
            </tr>
            {/* CSV Upload sub-row */}
            {csvOpen===a.id&&<tr key={`csv-${a.id}`}>
              <td colSpan={10} style={{padding:`${SP.sm}px ${SP.md}px`,borderBottom:`0.5px solid ${B.border}`}}>
                <CsvUploadPanel asset={a} onApply={data=>applyUpload(a.id,data)} onClose={()=>setCsvOpen(null)}/>
              </td>
            </tr>}
          </>;
        })}</tbody>
        <tfoot>
          <tr style={{background:B.offWhite}}>
            <td colSpan={4} style={{...td,fontWeight:700,fontSize:12,fontFamily:FF,color:B.textPrimary}}>Total</td>
            <td style={{...td,fontWeight:700,textAlign:"right",color:B.textPrimary,fontFamily:FF}}>
              <span style={{fontSize:9,fontWeight:400,color:B.textMuted,marginRight:3}}>BV</span>€{tBV.toFixed(1)}m
            </td>
            <td style={{...td,fontWeight:700,textAlign:"right",color:B.terracotta,fontFamily:FF}}>
              <span style={{fontSize:9,fontWeight:400,color:B.textMuted,marginRight:3}}>FV</span>€{tFV.toFixed(1)}m
            </td>
            <td colSpan={4}/>
          </tr>
        </tfoot>
      </table>
    </div>}

    {tab==="debt"&&<div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr>{["Asset","Lender","O/S €m","LTV%","Margin","Maturity","Cov.LTV","Cov.DSCR","Hedged"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
        <tbody>{debt.map(d=>{const lp=d.covenantLtv?(d.ltv/d.covenantLtv)*100:0;return <tr key={d.id} onMouseEnter={e=>e.currentTarget.style.background=B.offWhite} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <td style={{...td,fontSize:11,color:B.textSecondary,maxWidth:110}}>{(d.assetRef||"—").split(" ").slice(0,3).join(" ")}…</td>
          <td style={td}><EC value={d.lender} onChange={v=>ud(d.id,"lender",v)}/></td>
          <td style={td}><EC value={d.outstanding} onChange={v=>ud(d.id,"outstanding",v)} type="number" align="right" prefix="€"/></td>
          <td style={td}>
            <div style={{display:"flex",gap:3,alignItems:"center"}}>
              <EC value={d.ltv} onChange={v=>ud(d.id,"ltv",v)} type="number" align="right"/>
              {lp>80&&<span style={{fontSize:9,background:B.dangerBg,color:B.danger,padding:"1px 3px",borderRadius:3,fontWeight:700,border:`0.5px solid ${B.dangerBorder}`}}>!</span>}
            </div>
          </td>
          <td style={td}><EC value={d.margin} onChange={v=>ud(d.id,"margin",v)} type="number" align="right"/></td>
          <td style={td}><EC value={d.maturity} onChange={v=>ud(d.id,"maturity",v)}/></td>
          <td style={{...td,fontSize:11,color:B.textSecondary}}>{d.covenantLtv}%</td>
          <td style={{...td,fontSize:11,color:B.textSecondary}}>{d.covenantDscr}x</td>
          <td style={td}>
            <button onClick={()=>ud(d.id,"hedged",!d.hedged)} style={{fontSize:11,padding:"2px 8px",borderRadius:4,fontFamily:FF,fontWeight:600,
              background:d.hedged?B.successBg:B.warningBg,color:d.hedged?B.success:B.warning,
              border:`0.5px solid ${d.hedged?B.successBorder:B.warningBorder}`,cursor:"pointer"}}>
              {d.hedged?"Yes":"No"}
            </button>
          </td>
        </tr>;})}
        </tbody>
        <tfoot>
          <tr style={{background:B.offWhite}}>
            <td colSpan={2} style={{...td,fontWeight:700,fontSize:12,fontFamily:FF,color:B.textPrimary}}>Total</td>
            <td style={{...td,fontWeight:700,textAlign:"right",color:B.terracotta,fontFamily:FF}}>€{tD.toFixed(1)}m</td>
            <td colSpan={6}/>
          </tr>
        </tfoot>
      </table>
    </div>}

    {tab==="updates"&&<div style={{display:"flex",flexDirection:"column",gap:SP.md}}>
      {assets.map(a=><div key={a.id} style={{border:`0.5px solid ${B.border}`,borderRadius:10,padding:`${SP.md}px ${SP.base}px`,background:B.white}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:SP.md}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:B.textPrimary,fontFamily:FF}}>{a.name||"Unnamed"}</div>
            <div style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>{a.country} · {a.type}</div>
          </div>
          <span style={{fontSize:11,background:B.offWhite,color:B.textSecondary,padding:"3px 9px",borderRadius:4,border:`0.5px solid ${B.border}`,fontFamily:FF}}>
            Occ {a.occupancy}% · WALB {a.walb}y
          </span>
        </div>
        <div style={{marginBottom:SP.sm}}>
          <Lbl c="Event Tags"/>
          <div style={{display:"flex",flexWrap:"wrap",gap:SP.sm-2}}>
            {ASSET_TAGS.map(t=>{const sel=(notes[a.id+"_t"]||[]).includes(t);return <button key={t} onClick={()=>setNotes(n=>({...n,[a.id+"_t"]:sel?(n[a.id+"_t"]||[]).filter(x=>x!==t):[...(n[a.id+"_t"]||[]),t]}))}
              style={{padding:"3px 9px",fontSize:11,fontFamily:FF,border:`0.5px solid ${sel?B.navy:B.border}`,borderRadius:4,cursor:"pointer",
                background:sel?B.navy:"transparent",color:sel?B.white:B.textSecondary,fontWeight:sel?600:400}}>
              {t}
            </button>;})}</div>
        </div>
        <div>
          <Lbl c="Analyst Note"/>
          <textarea value={notes[a.id]||""} onChange={e=>setNotes(n=>({...n,[a.id]:e.target.value}))} rows={2}
            style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",fontSize:12,fontFamily:FF,
              border:`0.5px solid ${B.border}`,borderRadius:6,background:B.offWhite,color:B.textPrimary,
              resize:"vertical",outline:"none"}}
            onFocus={e=>{e.target.style.borderColor=B.terracotta;}}
            onBlur={e=>{e.target.style.borderColor=B.border;}}/>
        </div>
      </div>)}
    </div>}

    {tab==="market"&&<div>
      <Card title="Market Research Files" sub="AI cites these in market commentary.">
        <MDrop files={mkt.files} onAdd={f=>setMkt(m=>({...m,files:[...m.files,f]}))} onRemove={i=>setMkt(m=>({...m,files:m.files.filter((_,j)=>j!==i)}))} label="Upload JLL, CBRE, Savills reports etc."/>
      </Card>
      <Card title="Market Data by Geography" sub="Structured inputs per market. AI uses these for narrative; charts render automatically."
        action={<Btn onClick={()=>setMkt(m=>({...m,sources:[...m.sources,{id:uid(),geo:"France",src:"Broker Research",pub:"",date:"",notes:"",primeYield:"",vacancy:"",rentalGrowth:"",investActivity:"",occupierDemand:""}]}))} v="secondary">+ Add Geography</Btn>}>
        {mkt.sources.length===0&&<div style={{border:`0.5px dashed ${B.border}`,borderRadius:6,padding:SP.md,textAlign:"center",color:B.textMuted,fontSize:12,fontFamily:FF}}>No geographies yet — add one to unlock chart previews</div>}
        {mkt.sources.map(s=><div key={s.id} style={{border:`0.5px solid ${B.border}`,borderRadius:8,padding:SP.md,marginBottom:SP.md,background:B.offWhite}}>
          <div style={{display:"flex",gap:SP.sm,marginBottom:SP.md,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{flex:"0 0 105px"}}><Sel value={s.geo} onChange={v=>setMkt(m=>({...m,sources:m.sources.map(x=>x.id===s.id?{...x,geo:v}:x)}))} opts={MKT_GEO}/></div>
            <div style={{flex:"0 0 125px"}}><Sel value={s.src} onChange={v=>setMkt(m=>({...m,sources:m.sources.map(x=>x.id===s.id?{...x,src:v}:x)}))} opts={MKT_SRC}/></div>
            <div style={{flex:"1 1 90px"}}><Inp value={s.pub} onChange={v=>setMkt(m=>({...m,sources:m.sources.map(x=>x.id===s.id?{...x,pub:v}:x)}))} placeholder="Publisher"/></div>
            <div style={{flex:"0 0 75px"}}><Inp value={s.date} onChange={v=>setMkt(m=>({...m,sources:m.sources.map(x=>x.id===s.id?{...x,date:v}:x)}))} placeholder="Q3 2024"/></div>
            <button onClick={()=>setMkt(m=>({...m,sources:m.sources.filter(x=>x.id!==s.id)}))} style={{width:26,height:26,background:"none",border:`0.5px solid ${B.dangerBorder}`,borderRadius:4,color:B.danger,cursor:"pointer",fontSize:12}}>×</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:SP.sm,marginBottom:SP.sm}}>
            {[["primeYield","Prime Yield %"],["vacancy","Vacancy %"],["rentalGrowth","Rental Growth %"],["investActivity","Invest. Activity €bn"],["occupierDemand","Occupier Demand"]].map(([k,lbl])=>(
              <div key={k}>
                <div style={{fontSize:10,color:B.textMuted,fontFamily:FF,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{lbl}</div>
                <Inp value={s[k]||""} onChange={v=>setMkt(m=>({...m,sources:m.sources.map(x=>x.id===s.id?{...x,[k]:v}:x)}))} placeholder={k==="occupierDemand"?"High/Med/Low":"0.00"} st={{fontSize:12,padding:"5px 8px"}}/>
              </div>
            ))}
          </div>
          <textarea value={s.notes} onChange={e=>setMkt(m=>({...m,sources:m.sources.map(x=>x.id===s.id?{...x,notes:e.target.value}:x)}))} rows={2} placeholder="Additional context or qualitative notes…"
            style={{width:"100%",boxSizing:"border-box",padding:"7px 10px",fontSize:12,fontFamily:FF,border:`0.5px solid ${B.border}`,borderRadius:6,background:B.white,color:B.textPrimary,resize:"vertical",outline:"none"}}
            onFocus={e=>e.target.style.borderColor=B.terracotta} onBlur={e=>e.target.style.borderColor=B.border}/>
        </div>)}
        {mkt.sources.length>0&&mkt.sources.some(s=>s.primeYield||s.vacancy||s.rentalGrowth)&&(
          <div style={{marginTop:SP.base,padding:SP.base,background:B.offWhite,borderRadius:8,border:`0.5px solid ${B.border}`}}>
            <div style={{fontSize:11,color:B.textSecondary,fontFamily:FF,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:SP.md}}>Chart Preview</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:SP.base}}>
              <MiniBar label="Prime Yield %" color={B.navy} data={mkt.sources.filter(s=>s.primeYield).map(s=>({label:s.geo.slice(0,3),value:s.primeYield}))}/>
              <MiniBar label="Vacancy %" color={B.terracotta} data={mkt.sources.filter(s=>s.vacancy).map(s=>({label:s.geo.slice(0,3),value:s.vacancy}))}/>
              <MiniBar label="Rental Growth %" color={B.success} data={mkt.sources.filter(s=>s.rentalGrowth).map(s=>({label:s.geo.slice(0,3),value:s.rentalGrowth}))}/>
            </div>
          </div>
        )}
      </Card>
    </div>}

    {tab==="financials"&&<FinancialsTab fin={fin} setFin={setFin} assets={assets} debt={debt}/>}

    <div style={{display:"flex",justifyContent:"space-between",marginTop:SP.base}}>
      <Btn onClick={onBack} v="ghost" sz="lg">← Back</Btn>
      <Btn onClick={onNext} v="primary" sz="lg">Continue to Report Structure →</Btn>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3
// ═══════════════════════════════════════════════════════════════════════════════
function Step3({structure,setStructure,onBack,onNext}){
  const [saved,setSaved]=useState({});
  const [modal,setModal]=useState(false);
  const [sName,setSName]=useState("");
  const [sErr,setSErr]=useState("");
  const [dFrom,setDFrom]=useState(null);
  const [dOver,setDOver]=useState(null);

  const active=structure.active;
  const activeIds=active.map(s=>s.id);
  const lib=SECTION_LIB.filter(s=>!activeIds.includes(s.id));
  const totalPg=active.reduce((n,s)=>{if(s.parked)return n;const d=SECTION_LIB.find(l=>l.id===s.id);return n+(d?.pages||1);},0);

  const applyPreset=name=>{const ids=PRESETS[name]||saved[name]||[];setStructure(st=>({...st,active:ids.map(id=>({id,parked:false}))}));};
  const addSec=id=>setStructure(st=>({...st,active:[...st.active,{id,parked:false}]}));
  const remSec=id=>setStructure(st=>({...st,active:st.active.filter(s=>s.id!==id)}));
  const parkSec=id=>setStructure(st=>({...st,active:st.active.map(s=>s.id===id?{...s,parked:!s.parked}:s)}));
  const dEnd=()=>{
    if(dFrom!==null&&dOver!==null&&dFrom!==dOver){
      const arr=[...active]; const [m]=arr.splice(dFrom,1); arr.splice(dOver,0,m);
      setStructure(st=>({...st,active:arr}));
    }
    setDFrom(null); setDOver(null);
  };
  const doSave=()=>{
    if(!sName.trim()){setSErr("Enter a name");return;}
    if(PRESETS[sName.trim()]){setSErr("Cannot overwrite built-in preset");return;}
    setSaved(s=>({...s,[sName.trim()]:activeIds})); setModal(false); setSName(""); setSErr("");
  };

  return <div>
    {modal&&<div style={{position:"fixed",inset:0,background:"rgba(15,39,68,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:B.white,borderRadius:12,padding:"24px 28px",width:340,border:`0.5px solid ${B.border}`}}>
        <div style={{fontSize:14,color:B.navy,fontFamily:FF,fontWeight:700,marginBottom:SP.md}}>Save preset</div>
        <Inp value={sName} onChange={v=>{setSName(v);setSErr("");}} placeholder="Name this structure"/>
        {sErr&&<div style={{color:B.danger,fontSize:12,fontFamily:FF,marginTop:4}}>{sErr}</div>}
        <div style={{display:"flex",gap:SP.sm,justifyContent:"flex-end",marginTop:SP.md}}>
          <Btn onClick={()=>{setModal(false);setSName("");}} v="ghost">Cancel</Btn>
          <Btn onClick={doSave} v="primary">Save</Btn>
        </div>
      </div>
    </div>}

    <div style={{marginBottom:SP.md}}>
      <div style={{fontSize:11,color:B.textMuted,fontFamily:FF,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:SP.sm}}>Start from a preset</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:SP.sm}}>
        {Object.keys(PRESETS).map(n=><button key={n} onClick={()=>applyPreset(n)}
          style={{padding:"6px 14px",fontSize:12,fontFamily:FF,fontWeight:600,border:`0.5px solid ${B.border}`,borderRadius:6,background:B.white,color:B.textPrimary,cursor:"pointer"}}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=B.navy;e.currentTarget.style.background=B.offWhite;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=B.border;e.currentTarget.style.background=B.white;}}>
          {n}
        </button>)}
        {Object.keys(saved).map(n=><div key={n} style={{display:"flex",border:`0.5px solid ${B.successBorder}`,borderRadius:6,overflow:"hidden"}}>
          <button onClick={()=>applyPreset(n)} style={{padding:"6px 10px",fontSize:12,fontFamily:FF,fontWeight:600,border:"none",background:B.successBg,color:B.success,cursor:"pointer"}}>⭐ {n}</button>
          <button onClick={()=>setSaved(s=>{const u={...s};delete u[n];return u;})} style={{padding:"6px 8px",border:"none",borderLeft:`0.5px solid ${B.successBorder}`,background:B.successBg,color:B.danger,cursor:"pointer",fontSize:11}}>×</button>
        </div>)}
      </div>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:SP.md,marginBottom:SP.md}}>
      <div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:SP.sm}}>
          <div style={{fontSize:11,color:B.textSecondary,fontFamily:FF,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em"}}>Active — in order</div>
          <div style={{fontSize:10,color:B.textMuted,fontFamily:FF}}>Drag · ⏸ to park</div>
        </div>
        <div style={{minHeight:140,border:`0.5px solid ${B.border}`,borderRadius:8,overflow:"hidden",background:B.white}}>
          {active.length===0&&<div style={{padding:SP.lg,textAlign:"center",color:B.textMuted,fontSize:12,fontFamily:FF}}>No sections yet</div>}
          {active.map((s,i)=>{
            const def=SECTION_LIB.find(l=>l.id===s.id);
            if(!def) return null;
            return <div key={s.id} draggable
              onDragStart={()=>setDFrom(i)} onDragEnter={()=>setDOver(i)} onDragEnd={dEnd} onDragOver={e=>e.preventDefault()}
              style={{display:"flex",alignItems:"center",gap:SP.sm,padding:"9px 12px",
                background:dFrom===i?B.infoBg:dOver===i?B.offWhite:B.white,
                borderBottom:`0.5px solid ${B.border}`,cursor:"grab",opacity:dFrom===i?0.5:1,
                borderLeft:dOver===i?`3px solid ${B.terracotta}`:"3px solid transparent"}}>
              <span style={{color:B.borderDark,fontSize:13,flexShrink:0}}>⠿</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:s.parked?B.textMuted:B.textPrimary,fontFamily:FF}}>{def.label}</div>
                <div style={{fontSize:10,color:B.textMuted,fontFamily:FF}}>{def.desc}</div>
              </div>
              <div style={{display:"flex",gap:SP.xs,flexShrink:0,alignItems:"center"}}>
                <Tag variant={def.custom?"custom":def.core?"core":"opt"}>{def.custom?"custom":def.core?"core":"opt"}</Tag>
                <button onClick={()=>parkSec(s.id)} style={{fontSize:11,background:"none",border:"none",cursor:"pointer",color:s.parked?"#E67E22":B.borderDark,padding:"0 2px"}}
                  onMouseEnter={e=>e.currentTarget.style.color="#E67E22"} onMouseLeave={e=>e.currentTarget.style.color=s.parked?"#E67E22":B.borderDark}>⏸</button>
                <button onClick={()=>remSec(s.id)} style={{fontSize:12,background:"none",border:"none",cursor:"pointer",color:B.borderDark,padding:"0 2px"}}
                  onMouseEnter={e=>e.currentTarget.style.color=B.danger} onMouseLeave={e=>e.currentTarget.style.color=B.borderDark}>×</button>
              </div>
            </div>;
          })}
        </div>
      </div>
      <div>
        <div style={{fontSize:11,color:B.textSecondary,fontFamily:FF,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:SP.sm}}>Section library</div>
        <div style={{border:`0.5px solid ${B.border}`,borderRadius:8,overflow:"hidden",background:B.white}}>
          {lib.length===0&&<div style={{padding:SP.lg,textAlign:"center",color:B.textMuted,fontSize:12,fontFamily:FF}}>All sections active</div>}
          {lib.map(def=><div key={def.id} style={{display:"flex",alignItems:"center",gap:SP.sm,padding:"9px 12px",borderBottom:`0.5px solid ${B.border}`,background:B.white}}
            onMouseEnter={e=>e.currentTarget.style.background=B.offWhite} onMouseLeave={e=>e.currentTarget.style.background=B.white}>
            <button onClick={()=>addSec(def.id)} style={{width:20,height:20,borderRadius:"50%",border:"none",background:B.terracotta,color:B.white,cursor:"pointer",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>+</button>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:B.textPrimary,fontFamily:FF}}>{def.label}</div>
              <div style={{fontSize:10,color:B.textMuted,fontFamily:FF}}>{def.desc}</div>
            </div>
            <Tag variant={def.custom?"custom":def.core?"core":"opt"}>{def.custom?"custom":def.core?"core":"opt"}</Tag>
          </div>)}
        </div>
      </div>
    </div>

    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:B.offWhite,borderRadius:8,border:`0.5px solid ${B.border}`,marginBottom:SP.base}}>
      <div style={{fontSize:13,fontFamily:FF,color:B.textPrimary}}>
        <b>{active.length}</b> <span style={{color:B.textSecondary}}>sections</span> · <b>~{totalPg}</b> <span style={{color:B.textSecondary}}>pages</span>
        {active.some(s=>s.parked)&&<> · <span style={{color:"#E67E22",fontWeight:600}}>{active.filter(s=>s.parked).length} parked</span></>}
      </div>
      <Btn onClick={()=>setModal(true)} v="green" disabled={active.length===0}>💾 Save preset</Btn>
    </div>
    <div style={{display:"flex",justifyContent:"space-between"}}>
      <Btn onClick={onBack} v="ghost" sz="lg">← Back</Btn>
      <Btn onClick={onNext} v="primary" sz="lg" disabled={active.filter(s=>!s.parked).length===0}>Confirm Structure →</Btn>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4
// ═══════════════════════════════════════════════════════════════════════════════
function Step4({assets,debt,mkt,structure,notes,user,auditLog,setAuditLog,resolutions,setResolutions,onBack,onNext}){
  const flags=getFlags(assets,debt,mkt,structure,notes);
  const [drafts,setDrafts]=useState({});
  const [open,setOpen]=useState({});
  const crits=flags.filter(f=>f.sev==="critical");
  const warns=flags.filter(f=>f.sev==="warning");
  const infos=flags.filter(f=>f.sev==="info");
  const canGo=crits.filter(f=>!resolutions[f.id]).length===0;

  const SC={
    critical:{c:B.danger,bg:B.dangerBg,b:B.dangerBorder,icon:"🔴",l:"Critical"},
    warning:{c:B.warning,bg:B.warningBg,b:B.warningBorder,icon:"🟡",l:"Warning"},
    info:{c:B.info,bg:B.infoBg,b:B.infoBorder,icon:"🔵",l:"Info"},
  };

  const doResolve=id=>{const n=(drafts[id]||"").trim();if(n.length<15)return;setResolutions(r=>({...r,[id]:{note:n,at:nowStr(),by:user.name,role:user.role}}));setAuditLog(l=>[...l,{ts:nowStr(),u:user.name,d:`Flag "${flags.find(f=>f.id===id)?.title}" resolved: "${n}"`}]);};
  const doUnresolve=id=>{setResolutions(r=>{const n={...r};delete n[id];return n;});setAuditLog(l=>[...l,{ts:nowStr(),u:user.name,d:"Flag reopened."}]);};
  const activeSecs=structure.active.filter(s=>!s.parked);

  return <div>
    {/* Session bar */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:B.offWhite,border:`0.5px solid ${B.border}`,borderRadius:8,padding:"10px 14px",marginBottom:SP.base}}>
      <div style={{display:"flex",alignItems:"center",gap:SP.md}}>
        <div style={{width:28,height:28,borderRadius:"50%",background:B.navy,display:"flex",alignItems:"center",justifyContent:"center",color:B.white,fontSize:11,fontWeight:700,fontFamily:FF}}>
          {user.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:B.textPrimary,fontFamily:FF}}>{user.name} · {user.role}</div>
          <div style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>Audit trail active</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:SP.sm}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:B.success}}/>
        <span style={{fontSize:11,color:B.textSecondary,fontFamily:FF}}>Audit live</span>
      </div>
    </div>

    {/* Summary KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:SP.md,marginBottom:SP.lg}}>
      {[
        {l:"Critical",v:crits.length,s:`${crits.filter(f=>!resolutions[f.id]).length} unresolved`,ac:B.danger,bg:B.dangerBg,bc:B.dangerBorder},
        {l:"Warnings",v:warns.length,s:`${warns.filter(f=>!resolutions[f.id]).length} unresolved`,ac:"#E67E22",bg:B.warningBg,bc:B.warningBorder},
        {l:"Info",v:infos.length,s:"Advisory",ac:B.info,bg:B.infoBg,bc:B.infoBorder},
        {l:"Resolved",v:Object.keys(resolutions).length,s:`of ${flags.length} total`,ac:B.success,bg:B.successBg,bc:B.successBorder},
      ].map(k=>(
        <div key={k.l} style={{background:k.bg,borderRadius:8,padding:"12px 14px",border:`0.5px solid ${k.bc}`,borderLeft:`3px solid ${k.ac}`}}>
          <div style={{fontSize:10,color:k.ac,fontFamily:FF,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>{k.l}</div>
          <div style={{fontSize:20,fontWeight:700,color:k.ac,fontFamily:FF}}>{k.v}</div>
          <div style={{fontSize:11,color:k.ac,fontFamily:FF,opacity:0.75}}>{k.s}</div>
        </div>
      ))}
    </div>

    {/* Coverage */}
    <Card title="Data Coverage by Section">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:SP.sm}}>
        {activeSecs.map(s=>{const def=SECTION_LIB.find(l=>l.id===s.id);if(!def)return null;
          const chk=getCov(s.id,assets,debt,mkt,notes);
          const ok=chk.filter(c=>c.ok).length;
          const sc=chk.length?Math.round((ok/chk.length)*100):100;
          const col=sc===100?B.success:sc>=60?"#E67E22":B.danger;
          const bg=sc===100?B.successBg:sc>=60?B.warningBg:B.dangerBg;
          const bc=sc===100?B.successBorder:sc>=60?B.warningBorder:B.dangerBorder;
          return <div key={s.id} style={{border:`0.5px solid ${bc}`,borderRadius:8,padding:"10px 12px",background:bg}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:SP.xs}}>
              <div style={{fontSize:12,fontWeight:700,color:B.textPrimary,fontFamily:FF}}>{def.label}</div>
              <div style={{display:"flex",alignItems:"center",gap:SP.xs}}>
                <span style={{fontSize:12,fontWeight:700,color:col,fontFamily:FF}}>{sc}%</span>
                <div style={{width:34,height:3,background:`${col}30`,borderRadius:2}}>
                  <div style={{height:"100%",borderRadius:2,width:`${sc}%`,background:col}}/>
                </div>
              </div>
            </div>
            {chk.map((c,i)=><div key={i} style={{display:"flex",gap:SP.xs,marginBottom:1}}>
              <span style={{fontSize:10,color:c.ok?B.success:B.borderDark}}>{c.ok?"✓":"○"}</span>
              <span style={{fontSize:10,color:B.textSecondary,fontFamily:FF}}>{c.l}</span>
            </div>)}
          </div>;
        })}
      </div>
    </Card>

    {/* Flags */}
    <Card title="Analyst Flags" sub="Critical flags require a resolution note before generation is unlocked.">
      {flags.length===0&&<div style={{textAlign:"center",padding:SP.lg,background:B.successBg,borderRadius:8,border:`0.5px solid ${B.successBorder}`}}>
        <div style={{fontSize:18,marginBottom:4}}>✓</div>
        <div style={{fontSize:13,fontWeight:700,color:B.success,fontFamily:FF}}>No flags — all checks passed</div>
      </div>}
      {[...crits,...warns,...infos].map(flag=>{
        const cfg=SC[flag.sev]; const res=resolutions[flag.id]; const isOpen=open[flag.id]; const draft=drafts[flag.id]||""; const dOk=draft.trim().length>=15;
        return <div key={flag.id} style={{border:`0.5px solid ${res?B.successBorder:cfg.b}`,borderRadius:8,marginBottom:SP.sm,background:res?B.successBg:cfg.bg,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:SP.sm,padding:"10px 14px",cursor:"pointer"}} onClick={()=>setOpen(o=>({...o,[flag.id]:!isOpen}))}>
            <span style={{fontSize:12}}>{res?"✅":cfg.icon}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:SP.sm,flexWrap:"wrap"}}>
                <span style={{fontSize:12,fontWeight:700,color:res?B.success:cfg.c,fontFamily:FF}}>{flag.title}</span>
                <Tag variant={res?"resolved":"default"}>{res?"Resolved":cfg.l}</Tag>
                <span style={{fontSize:10,color:B.textSecondary,fontFamily:FF,background:B.offWhite,padding:"1px 6px",borderRadius:3,border:`0.5px solid ${B.border}`}}>{flag.cat}</span>
              </div>
              {res&&<div style={{fontSize:11,color:B.success,fontFamily:FF,marginTop:2}}>"{res.note.slice(0,70)}{res.note.length>70?"…":""}" — {res.by}, {res.at}</div>}
            </div>
            <span style={{color:B.textMuted,fontSize:11}}>{isOpen?"▲":"▼"}</span>
          </div>
          {isOpen&&<div style={{padding:`0 ${SP.base}px ${SP.base}px`,borderTop:`0.5px solid ${res?B.successBorder:cfg.b}`}}>
            <div style={{marginTop:SP.md,fontSize:12,color:B.textPrimary,fontFamily:FF,lineHeight:1.6,marginBottom:SP.sm}}>{flag.detail}</div>
            <div style={{fontSize:11,color:B.textMuted,fontFamily:FF,marginBottom:SP.md}}>Ref: {flag.ref} · Section: {SECTION_LIB.find(s=>s.id===flag.sec)?.label}</div>
            {!res?<div>
              <Lbl c={`Resolution Note${flag.sev!=="info"?" *":""}`}/>
              <div style={{fontSize:10,color:B.textMuted,fontFamily:FF,marginTop:-4,marginBottom:SP.sm}}>min 15 chars · logged with name + timestamp</div>
              <textarea value={draft} onChange={e=>setDrafts(d=>({...d,[flag.id]:e.target.value}))} rows={3} placeholder="Describe how this has been addressed…"
                style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",fontSize:12,fontFamily:FF,
                  border:`0.5px solid ${dOk?B.successBorder:B.border}`,borderRadius:6,background:B.white,color:B.textPrimary,resize:"vertical",outline:"none"}}
                onFocus={e=>e.target.style.borderColor=B.terracotta} onBlur={e=>e.target.style.borderColor=dOk?B.successBorder:B.border}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:SP.sm}}>
                <span style={{fontSize:11,color:draft.length<15?B.danger:B.success,fontFamily:FF}}>{draft.trim().length}/15{dOk&&" ✓"}</span>
                <Btn onClick={()=>doResolve(flag.id)} disabled={!dOk} v={dOk?"green":"ghost"}>Mark resolved →</Btn>
              </div>
            </div>:<div style={{background:B.successBg,borderRadius:6,padding:"10px 12px",border:`0.5px solid ${B.successBorder}`}}>
              <div style={{fontSize:11,fontWeight:700,color:B.success,fontFamily:FF,marginBottom:2}}>By {res.by} ({res.role}) · {res.at}</div>
              <div style={{fontSize:12,color:B.success,fontFamily:FF}}>{res.note}</div>
              <button onClick={()=>doUnresolve(flag.id)} style={{marginTop:SP.sm,fontSize:11,color:B.danger,background:"none",border:"none",cursor:"pointer",fontFamily:FF,padding:0}}>↩ Reopen</button>
            </div>}
          </div>}
        </div>;
      })}
    </Card>

    {auditLog.length>0&&<Card title="Session Audit Log">
      <div style={{background:B.navy,borderRadius:6,padding:"10px 12px",maxHeight:140,overflowY:"auto"}}>
        {[...auditLog].reverse().map((e,i)=><div key={i} style={{display:"flex",gap:SP.sm,marginBottom:3}}>
          <span style={{fontSize:10,color:"#4A7ABF",whiteSpace:"nowrap"}}>{e.ts}</span>
          <span style={{fontSize:10,color:"#7A9BC2"}}>[{e.u}]</span>
          <span style={{fontSize:10,color:"#C8D8EE"}}>{e.d}</span>
        </div>)}
      </div>
    </Card>}

    {!canGo&&<div style={{background:B.dangerBg,border:`0.5px solid ${B.dangerBorder}`,borderRadius:8,padding:"10px 14px",marginBottom:SP.md,display:"flex",gap:SP.md}}>
      <span>🔒</span>
      <div>
        <div style={{fontSize:13,fontWeight:700,color:B.danger,fontFamily:FF}}>Generation locked</div>
        <div style={{fontSize:12,color:B.danger,fontFamily:FF,opacity:0.8}}>{crits.filter(f=>!resolutions[f.id]).length} critical flag(s) must be resolved first.</div>
      </div>
    </div>}
    {canGo&&<div style={{background:B.successBg,border:`0.5px solid ${B.successBorder}`,borderRadius:8,padding:"10px 14px",marginBottom:SP.md,display:"flex",alignItems:"center",gap:SP.md}}>
      <span>✅</span>
      <div>
        <div style={{fontSize:13,fontWeight:700,color:B.success,fontFamily:FF}}>Ready for generation</div>
        <div style={{fontSize:12,color:B.success,fontFamily:FF}}>All critical flags resolved.</div>
      </div>
    </div>}
    <div style={{display:"flex",justifyContent:"space-between"}}>
      <Btn onClick={onBack} v="ghost" sz="lg">← Back</Btn>
      <Btn onClick={onNext} disabled={!canGo} v="primary" sz="lg">Proceed to Generation →</Btn>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 5
// ═══════════════════════════════════════════════════════════════════════════════
function Step5({cfg,assets,debt,notes,mkt,structure,user,resolutions,flags,auditLog,setAuditLog,onBack}){
  const [contents,setContents]=useState({});
  const [edited,setEdited]=useState({});
  const [genning,setGenning]=useState({});
  const [errs,setErrs]=useState({});
  const [sigs,setSigs]=useState({});
  const [snrSig,setSnrSig]=useState(null);
  const [snrName,setSnrName]=useState("");
  const [snrRole,setSnrRole]=useState("Managing Director");
  const [showLog,setShowLog]=useState(false);
  const [exported,setExported]=useState(null);
  const active=structure.active.filter(s=>!s.parked);
  const genCnt=active.filter(s=>contents[s.id]).length;
  const allGen=active.every(s=>contents[s.id]);
  const allSig=active.every(s=>sigs[s.id]&&contents[s.id]);

  // ── DEMO MODE: fake generation — no live API calls ────────────────────────
  const FAKE_CONTENT = {
    cover: `${cfg.fundName} — ${cfg.reportingPeriod} Limited Partner Report. [SRC:fund_config] This report presents the portfolio performance, asset management activity, and financial position of the Fund for the quarter ended 30 September 2024, prepared in accordance with INREV guidelines and the Fund's limited partnership agreement. [SRC:fund_config] The Fund remains in its Investment Period, deploying capital across supply-constrained urban logistics corridors in Western Europe in line with its Value-Add mandate. [SRC:fund_config]`,

    exec: `The portfolio delivered resilient performance in ${cfg.reportingPeriod}, with gross asset value reaching €${assets.reduce((s,a)=>s+a.fairValue,0).toFixed(1)}m against a book value of €${assets.reduce((s,a)=>s+a.bookValue,0).toFixed(1)}m, reflecting an unrealised surplus of €${(assets.reduce((s,a)=>s+a.fairValue,0)-assets.reduce((s,a)=>s+a.bookValue,0)).toFixed(1)}m. [SRC:asset_table] Weighted average occupancy across the portfolio stands at ${(assets.reduce((s,a)=>s+a.occupancy,0)/assets.length).toFixed(1)}%, underpinned by covenant-grade tenant covenants including ${[...new Set(assets.flatMap(a=>a.tenants.split(",").map(t=>t.trim())))].slice(0,3).join(", ")}. [SRC:asset_table] Portfolio WALB of ${(assets.reduce((s,a)=>s+a.walb,0)/assets.length).toFixed(1)} years provides strong income visibility over the near-term horizon. [SRC:asset_table]\n\nAsset management activity in the quarter focused on lease renewals, capex delivery, and covenant monitoring across the five-asset portfolio. [SRC:analyst_note] The management team engaged proactively with occupiers on lease extensions at assets approaching shorter WALB thresholds, with heads of terms agreed on two renewal transactions. [SRC:analyst_note] Capital expenditure programmes progressed on schedule, with ESG-led repositioning works advancing at the Île-de-France logistics hub. [SRC:analyst_note]\n\nEuropean logistics fundamentals remain structurally supportive, with sustained occupier demand contrasting with constrained future supply of new developments across the Fund's target markets. [SRC:market_data] Prime logistics yields have stabilised following the 2022–2023 repricing cycle, and rental growth continues to outperform broader CRE sectors driven by e-commerce penetration and supply chain reconfiguration. [SRC:market_data] France and the Netherlands in particular continue to exhibit sub-4.5% vacancy, reinforcing the income resilience of the portfolio's core geographies. [SRC:market_data]\n\nThe outlook for the remainder of the investment period is constructive. [SRC:fund_config] The management team continues to evaluate off-market acquisition opportunities in the €5m–€30m segment consistent with the Fund's roll-up strategy, with two assets under active review. [SRC:fund_config] Distribution policy and deployment pace will be reviewed at the Q4 LP Advisory Committee meeting. [SRC:fund_config]`,

    highlights: `Gross Asset Value (GAV) at 30 September 2024 stands at €${assets.reduce((s,a)=>s+a.fairValue,0).toFixed(1)}m, representing an uplift of €${(assets.reduce((s,a)=>s+a.fairValue,0)-assets.reduce((s,a)=>s+a.bookValue,0)).toFixed(1)}m or ${((assets.reduce((s,a)=>s+a.fairValue,0)/assets.reduce((s,a)=>s+a.bookValue,0)-1)*100).toFixed(1)}% above aggregate book value. [SRC:asset_table] Total debt outstanding is €${debt.reduce((s,d)=>s+d.outstanding,0).toFixed(1)}m, implying a blended LTV of ${((debt.reduce((s,d)=>s+d.outstanding,0)/assets.reduce((s,a)=>s+a.fairValue,0))*100).toFixed(1)}% against current fair values. [SRC:debt_table] All loan-to-value covenants carry meaningful headroom, with the most proximate facility at ${Math.max(...debt.map(d=>d.covenantLtv?d.ltv/d.covenantLtv*100:0)).toFixed(0)}% of its LTV ceiling. [SRC:debt_table]\n\nNet Asset Value for the quarter reflects income accrual, valuation movement, and management fee deductions in line with the Fund's distribution waterfall. [SRC:fund_config] The blended interest margin across the debt portfolio is ${(debt.reduce((s,d)=>s+d.margin,0)/debt.length).toFixed(0)}bps, with ${debt.filter(d=>d.hedged).length} of ${debt.length} facilities fully hedged against floating rate exposure. [SRC:debt_table] Weighted average loan maturity extends to mid-2028, providing refinancing stability across the hold period. [SRC:debt_table]`,

    am: `The asset management report covers the five-asset portfolio totalling ${assets.reduce((s,a)=>s+a.area,0).toLocaleString()}sqm of logistics and last-mile warehouse space across France and the Netherlands. [SRC:asset_table] Portfolio occupancy is ${(assets.reduce((s,a)=>s+a.occupancy,0)/assets.length).toFixed(1)}% by area, with ${assets.filter(a=>a.occupancy===100).length} assets fully let and the remainder subject to active leasing programmes. [SRC:asset_table] Weighted average lease break (WALB) across the rent roll is ${(assets.reduce((s,a)=>s+a.walb,0)/assets.length).toFixed(1)} years, providing solid income duration for the near-term. [SRC:asset_table]\n\nDebt management: total drawn facilities of €${debt.reduce((s,d)=>s+d.outstanding,0).toFixed(1)}m are spread across ${[...new Set(debt.map(d=>d.lender))].length} lending institutions. [SRC:debt_table] All facilities are currently compliant with financial covenants; DSCR coverage ratios remain comfortably above the ${Math.min(...debt.map(d=>d.covenantDscr))}x minimum threshold across the portfolio. [SRC:debt_table] The management team is engaged with lenders on two facilities maturing in 2027 and anticipates refinancing activity in H2 2026. [SRC:debt_table]\n\nKey asset management actions in the quarter included lease renewal negotiations at Rotterdam Gateway and Amsterdam Urban Last-Mile, progression of BREEAM certification works at the Lyon Cross-Dock Facility, and commencement of the planned mechanical and electrical upgrade programme at Milan North Distribution Centre. [SRC:analyst_note]`,

    assets: assets.map(a=>`${a.name} (${a.country}, ${a.type}): The asset comprises ${a.area.toLocaleString()}sqm of ${a.type.toLowerCase()} warehouse space and is valued at €${a.fairValue}m against a book cost of €${a.bookValue}m, representing a ${((a.fairValue/a.bookValue-1)*100).toFixed(1)}% uplift. [SRC:asset_table] Occupancy stands at ${a.occupancy}%, with ${a.tenants} as principal occupiers on leases with a weighted average break of ${a.walb} years. [SRC:asset_table] ${notes[a.id]?`${notes[a.id]} [SRC:analyst_note]`:"No material events to report in the quarter. Asset performance is in line with underwriting assumptions. [SRC:analyst_note]"}`).join("\n\n"),

    market: `European logistics real estate fundamentals continue to demonstrate structural resilience, supported by sustained occupier demand and a meaningful contraction in new supply across the Fund's target markets. [SRC:market_data] Completions across Western Europe fell approximately 30% year-on-year in H1 2024 as rising construction costs and planning constraints curtailed speculative development pipelines, creating a structural supply shortfall that underpins rental growth expectations. [SRC:market_data]\n\nIn France, prime logistics yields have stabilised in the 4.75%–5.00% range following the 2022–2023 repricing cycle, with rental values continuing to grow as occupiers compete for best-in-class urban logistics space across the Île-de-France and Lyon corridors. [SRC:market_data] Vacancy in prime submarkets remains below 4%, reinforcing the income defensiveness of the Fund's French assets. [SRC:market_data]\n\nThe Netherlands remains one of Europe's most liquid and transparent logistics markets, with Rotterdam and Amsterdam commanding sustained occupier demand driven by port-related distribution and last-mile e-commerce growth. [SRC:market_data] Prime yields in the Amsterdam metropolitan area are broadly stable at 4.50%–4.75%, with rental growth outperforming the broader CRE sector for the third consecutive year. [SRC:market_data]`,

    esg: `The Fund's ESG programme is governed by the Manager's ESG Policy and is aligned with the UN Principles for Responsible Investment (PRI), to which the Manager is a signatory. [SRC:fund_config] The Fund targets BREEAM "Very Good" or above on all assets subject to material capital expenditure, with the Lyon Cross-Dock Facility currently under assessment for BREEAM In-Use certification. [SRC:analyst_note]\n\nGreen lease provisions have been incorporated into all new lease agreements executed in the reporting period, requiring tenants to share energy consumption data and cooperate with landlord sustainability initiatives. [SRC:analyst_note] The management team is compiling asset-level energy intensity and carbon intensity data for inclusion in the annual ESG report, to be published in Q1 2025 in line with INREV ESG reporting guidelines. [SRC:fund_config]`,

    inrev: `The following financial information has been prepared in accordance with INREV guidelines for non-listed real estate funds. [SRC:fund_config] Total Net Asset Value at 30 September 2024 is computed as Gross Asset Value of €${assets.reduce((s,a)=>s+a.fairValue,0).toFixed(1)}m less total debt of €${debt.reduce((s,d)=>s+d.outstanding,0).toFixed(1)}m and other liabilities. [SRC:asset_table] Asset-level fair values have been determined by independent external valuers in accordance with RICS Valuation — Global Standards (Red Book). [SRC:fund_config]\n\nThe NAV bridge for the quarter reflects a valuation movement, net income accrual, management fees, and distributions paid to limited partners. [SRC:fund_config] No carried interest has been accrued in the period. Total expense ratio (TER) for the quarter is within the budgeted range disclosed in the Fund's offering memorandum. [SRC:fund_config]`,

    disclaimer: `This document has been prepared by the Manager solely for informational purposes and is directed exclusively at professional investors as defined under MiFID II. It does not constitute investment advice, an offer to sell, or a solicitation of an offer to buy any interest in ${cfg.fundName} or any other fund managed by the Manager. Past performance is not indicative of future results. The value of investments and any income derived therefrom may go down as well as up. Prospective investors should review the Fund's offering documents in their entirety and consult their own legal, tax, and financial advisers before making any investment decision. This document is confidential and may not be reproduced or distributed without the prior written consent of the Manager. For professional investors only.`,

    pipeline: `The investment team is currently evaluating two acquisition opportunities consistent with the Fund's Value-Add mandate and target ticket size of €5m–€30m. [SRC:fund_config] Both assets are being sourced off-market through the manager's proprietary network of corporate and institutional vendors across Northern France and the Randstad metropolitan area. [SRC:analyst_note] Detailed due diligence, including structural surveys and lease covenant analysis, is underway on the primary target asset, with exclusivity targeted for Q4 2024. [SRC:analyst_note] No binding commitments have been entered into as at the reporting date. [SRC:fund_config]`,

    cashflow: `No distributions were declared or paid in ${cfg.reportingPeriod} in line with the Fund's income retention policy during the Investment Period. [SRC:fund_config] Aggregate rental income collected in the quarter was consistent with the annual business plan, with no material arrears recorded across the portfolio. [SRC:asset_table] The Fund's cash position remains adequate to meet near-term capital expenditure commitments and operational expenses without recourse to undrawn credit facilities. [SRC:fund_config]`,

    disposal: `No assets were placed under formal offer or in an active disposal process during ${cfg.reportingPeriod}. [SRC:fund_config] The management team continues to monitor market liquidity conditions across the Fund's core markets and will present a formal disposal strategy to the LP Advisory Committee at the year-end meeting. [SRC:analyst_note] Indicative market feedback on selected assets suggests pricing broadly in line with current independent valuations, providing confidence in the Fund's ability to execute selective realisations in 2025–2026. [SRC:analyst_note]`,

    debt_deep: `The Fund's debt portfolio comprises ${debt.length} bilateral facilities with a total drawn balance of €${debt.reduce((s,d)=>s+d.outstanding,0).toFixed(1)}m. [SRC:debt_table] Lenders include ${[...new Set(debt.map(d=>d.lender))].join(", ")}, all investment-grade European financial institutions with established relationships with the management team. [SRC:debt_table] The blended all-in margin across the portfolio is ${(debt.reduce((s,d)=>s+d.margin,0)/debt.length).toFixed(0)}bps over EURIBOR, with ${debt.filter(d=>d.hedged).length} facilities subject to interest rate hedging instruments. [SRC:debt_table]\n\nCovenant compliance: all facilities are reporting within LTV and DSCR thresholds as at 30 September 2024. [SRC:debt_table] The most proximate LTV covenant is at ${Math.max(...debt.map(d=>d.covenantLtv?Math.round(d.ltv/d.covenantLtv*100):0))}% of its ceiling, maintaining meaningful headroom against current valuations. [SRC:debt_table] The management team will initiate refinancing discussions on the two facilities maturing in 2027 during H1 2025 to ensure an orderly process. [SRC:debt_table]`,

    custom: `This section has been prepared to provide additional context to limited partners in ${cfg.fundName} for the ${cfg.reportingPeriod} reporting period. [SRC:fund_config] The management team welcomes queries from investors and their advisers and can be contacted through the standard investor relations channel. [SRC:fund_config]`,
  };

  const fakeSleep = ms => new Promise(r => setTimeout(r, ms));

  const genSec = async sid => {
    setGenning(g=>({...g,[sid]:true})); setErrs(e=>({...e,[sid]:null}));
    setSigs(s=>{const n={...s};delete n[sid];return n;});
    if(snrSig) setSnrSig(null);
    // Simulate network latency (800ms–1.6s)
    await fakeSleep(800 + Math.random() * 800);
    const txt = FAKE_CONTENT[sid] || FAKE_CONTENT.custom;
    setContents(c=>({...c,[sid]:txt})); setEdited(e=>({...e,[sid]:txt}));
    setAuditLog(l=>[...l,{ts:nowStr(),u:user.name,d:`Section "${SECTION_LIB.find(s=>s.id===sid)?.label}" generated (demo).`}]);
    setGenning(g=>({...g,[sid]:false}));
  };

  const genAll = async () => {
    for(const s of active){ await genSec(s.id); await fakeSleep(200); }
  };
  const signOff=sid=>{setSigs(s=>({...s,[sid]:{by:user.name,role:user.role,at:nowStr()}}));setAuditLog(l=>[...l,{ts:nowStr(),u:user.name,d:`Section "${SECTION_LIB.find(s=>s.id===sid)?.label}" signed off.`}]);};
  const handleEdit=(sid,val)=>{setEdited(e=>({...e,[sid]:val}));if(sigs[sid]){setSigs(s=>{const n={...s};delete n[sid];return n;});if(snrSig)setSnrSig(null);setAuditLog(l=>[...l,{ts:nowStr(),u:user.name,d:`Section "${SECTION_LIB.find(s=>s.id===sid)?.label}" edited — sign-off revoked.`}]);}};
  const parseSegs=txt=>{if(!txt)return[];const parts=txt.split(/(\[SRC:[^\]]+\])/g);const segs=[];let p=null;parts.forEach(x=>{if(x.startsWith("[SRC:")){const s=x.replace("[SRC:","").replace("]","");if(p!==null){segs.push({t:p.trim(),s,c:s==="analyst_note"||s==="market_data"?"amber":"green"});p=null;}}else{if(p!==null)segs.push({t:p.trim(),s:null,c:"green"});p=x;}});if(p?.trim())segs.push({t:p.trim(),s:null,c:"green"});return segs.filter(x=>x.t);};
  const doExport=()=>{
    const secs=active.map(s=>{const def=SECTION_LIB.find(l=>l.id===s.id);const txt=(edited[s.id]||"").replace(/\[SRC:[^\]]+\]/g,"").trim();const sig=sigs[s.id];return `${"═".repeat(54)}\n${def?.label?.toUpperCase()}\n${"═".repeat(54)}\n\n${txt}\n\n${sig?`[Reviewed: ${sig.by} (${sig.role}) · ${sig.at}]`:""}\n`;}).join("\n");
    const log=[...auditLog,{ts:nowStr(),u:user.name,d:"Report exported."}].map(e=>`[${e.ts}] [${e.u}] ${e.d}`).join("\n");
    const full=`${cfg.fundName}\n${cfg.reportingPeriod} LP Quarterly Report\nGenerated: ${nowStr()}\nPrepared: ${user.name} (${user.role})\n\n${secs}\n${"═".repeat(54)}\nAUDIT LOG\n${"═".repeat(54)}\n\n${log}\n\n${snrSig?`SENIOR APPROVAL: ${snrSig.name} (${snrSig.role}) · ${snrSig.at}`:"SENIOR APPROVAL: Pending"}`;
    try{
      const uri="data:text/plain;charset=utf-8,"+encodeURIComponent(full);
      const a=document.createElement("a");a.href=uri;a.download=`${cfg.fundName.replace(/\s+/g,"_")}_${cfg.reportingPeriod.replace(/\s+/g,"_")}.txt`;
      document.body.appendChild(a);a.click();document.body.removeChild(a);
    }catch(_){}
    setExported(full);
    setAuditLog(l=>[...l,{ts:nowStr(),u:user.name,d:"Report exported."}]);
  };

  return <div>
    {/* Showcase notice */}
    <div style={{display:"flex",alignItems:"flex-start",gap:SP.md,background:"#FFFBEB",border:"0.5px solid #E8D060",borderRadius:8,padding:"11px 14px",marginBottom:SP.base}}>
      <span style={{fontSize:15,flexShrink:0,marginTop:1}}>🎭</span>
      <div>
        <div style={{fontSize:12,fontWeight:700,color:"#7D5A00",fontFamily:FF,marginBottom:2}}>Portfolio showcase — demo mode</div>
        <div style={{fontSize:12,color:"#7D5A00",fontFamily:FF,lineHeight:1.55}}>
          The Generate buttons below are <strong>not connected to a live AI API</strong>. Pre-written sample narratives are displayed to illustrate how the tool would function in production. This prototype is for demonstration purposes only.
        </div>
      </div>
    </div>

    {/* Session bar */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:B.offWhite,border:`0.5px solid ${B.border}`,borderRadius:8,padding:"10px 14px",marginBottom:SP.base}}>
      <div style={{display:"flex",alignItems:"center",gap:SP.md}}>
        <div style={{width:28,height:28,borderRadius:"50%",background:B.navy,display:"flex",alignItems:"center",justifyContent:"center",color:B.white,fontSize:11,fontWeight:700,fontFamily:FF}}>
          {user.name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
        </div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:B.textPrimary,fontFamily:FF}}>{user.name} · {user.role}</div>
          <div style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>{genCnt}/{active.length} sections generated</div>
        </div>
      </div>
      <div style={{display:"flex",gap:SP.sm}}>
        <Btn onClick={()=>setShowLog(l=>!l)} v="ghost">{showLog?"Hide":"View"} log</Btn>
        <Btn onClick={genAll} disabled={active.length===0} v="secondary">⚡ Generate All (Demo)</Btn>
      </div>
    </div>

    {showLog&&<div style={{background:B.navy,borderRadius:8,padding:"10px 12px",marginBottom:SP.md,maxHeight:150,overflowY:"auto"}}>
      {[...auditLog].reverse().map((e,i)=><div key={i} style={{display:"flex",gap:SP.sm,marginBottom:3}}>
        <span style={{fontSize:10,color:"#4A7ABF",whiteSpace:"nowrap"}}>{e.ts}</span>
        <span style={{fontSize:10,color:"#7A9BC2"}}>[{e.u}]</span>
        <span style={{fontSize:10,color:"#C8D8EE"}}>{e.d}</span>
      </div>)}
    </div>}

    {active.map(s=>{
      const def=SECTION_LIB.find(l=>l.id===s.id);
      const txt=contents[s.id]; const isGen=genning[s.id]; const err=errs[s.id]; const sig=sigs[s.id];
      const segs=parseSegs(txt); const hasAmber=segs.some(sg=>sg.c==="amber");
      return <div key={s.id} style={{border:`0.5px solid ${sig?B.successBorder:B.border}`,borderRadius:10,marginBottom:SP.md,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 16px",background:sig?B.successBg:B.offWhite,borderBottom:`0.5px solid ${sig?B.successBorder:B.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:SP.md}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:txt?sig?B.success:hasAmber?"#E67E22":B.terracotta:B.borderDark}}/>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:B.textPrimary,fontFamily:FF}}>{def?.label}</div>
              <div style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>
                {txt&&"Generated"}{hasAmber&&" · ⚠ amber"}{sig&&` · ✓ ${sig.by}, ${sig.at}`}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:SP.sm,alignItems:"center"}}>
            {txt&&!sig&&<Btn onClick={()=>signOff(s.id)} v="green">✓ Sign off</Btn>}
            {sig&&<Tag variant="resolved">Approved</Tag>}
            <Btn onClick={()=>genSec(s.id)} disabled={isGen} v={txt?"ghost":"primary"} sz="sm">{isGen?"Generating…":txt?"↻ Regen (Demo)":"Generate (Demo)"}</Btn>
          </div>
        </div>

        {err&&<div style={{padding:"9px 16px",background:B.dangerBg,fontSize:12,color:B.danger,fontFamily:FF,border:`0.5px solid ${B.dangerBorder}`}}>{err}</div>}
        {isGen&&<div style={{padding:"18px 16px"}}>
          {[80,60,90,50].map((w,i)=><div key={i} style={{height:10,borderRadius:4,background:B.offWhite,marginBottom:SP.sm,width:`${w}%`}}/>)}
        </div>}
        {txt&&!isGen&&<div style={{padding:"14px 16px"}}>
          <div style={{fontSize:10,color:B.textMuted,fontFamily:FF,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:SP.sm,display:"flex",alignItems:"center",gap:SP.md}}>
            Annotated view
            <span style={{fontWeight:400,display:"flex",alignItems:"center",gap:SP.sm}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:B.success,display:"inline-block"}}/> Full data
              <span style={{width:6,height:6,borderRadius:"50%",background:"#E67E22",display:"inline-block",marginLeft:SP.sm}}/> Estimated
              <span style={{width:6,height:6,borderRadius:"50%",background:B.borderDark,display:"inline-block",marginLeft:SP.sm}}/> Interpretive
            </span>
          </div>
          <div style={{fontSize:13,lineHeight:1.9,fontFamily:FF,color:B.textPrimary}}>
            {segs.map((sg,i)=><span key={i} title={sg.s?`Source: ${sg.s}`:""}
              style={{borderBottom:sg.c==="green"?`2px solid ${B.success}40`:sg.c==="amber"?`2px solid ${"#E67E22"}60`:"none",cursor:sg.s?"help":"default"}}>
              {sg.t}{" "}
            </span>)}
          </div>
          <details style={{marginTop:SP.md}}>
            <summary style={{fontSize:11,color:B.textSecondary,fontFamily:FF,fontWeight:600,cursor:"pointer",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:SP.sm}}>
              Edit {sig&&<span style={{color:"#E67E22"}}>(edits revoke sign-off)</span>}
            </summary>
            <textarea value={edited[s.id]||""} onChange={e=>handleEdit(s.id,e.target.value)} rows={7}
              style={{width:"100%",boxSizing:"border-box",padding:"9px 11px",fontSize:12,fontFamily:FF,
                border:`0.5px solid ${B.border}`,borderRadius:6,background:B.offWhite,color:B.textPrimary,
                resize:"vertical",outline:"none",lineHeight:1.7}}
              onFocus={e=>e.target.style.borderColor=B.terracotta} onBlur={e=>e.target.style.borderColor=B.border}/>
            <div style={{fontSize:11,color:B.textMuted,fontFamily:FF,marginTop:3}}>Label: {edited[s.id]&&edited[s.id]!==txt?"Human-edited":"AI-generated"}</div>
          </details>
        </div>}
      </div>;
    })}

    {/* Approval workflow */}
    {allGen&&<div style={{border:`0.5px solid ${B.border}`,borderRadius:10,overflow:"hidden",marginTop:SP.sm,marginBottom:SP.base}}>
      <div style={{padding:"13px 18px",background:B.offWhite,borderBottom:`0.5px solid ${B.border}`}}>
        <div style={{fontSize:13,fontWeight:700,color:B.textPrimary,fontFamily:FF}}>Approval Workflow</div>
        <div style={{fontSize:12,color:B.textMuted,fontFamily:FF,marginTop:2}}>Two-level sign-off required before export.</div>
      </div>
      <div style={{padding:`${SP.base}px ${SP.lg}px`}}>
        <div style={{display:"flex",gap:SP.md,marginBottom:SP.base,alignItems:"flex-start"}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:allSig?B.success:B.borderDark,display:"flex",alignItems:"center",justifyContent:"center",color:B.white,fontSize:11,fontWeight:700,flexShrink:0}}>1</div>
          <div>
            <div style={{fontSize:12,fontWeight:700,color:B.textPrimary,fontFamily:FF,marginBottom:2}}>Analyst review — section-by-section</div>
            <div style={{fontSize:11,color:B.textMuted,fontFamily:FF,marginBottom:4}}>{active.filter(s=>sigs[s.id]).length}/{active.filter(s=>contents[s.id]).length} sections signed off</div>
            {!allSig?<div style={{fontSize:11,color:"#E67E22",fontFamily:FF}}>Sign off each section above before senior approval.</div>
              :<div style={{fontSize:11,color:B.success,fontFamily:FF,fontWeight:600}}>✓ All reviewed — {user.name}</div>}
          </div>
        </div>
        <div style={{display:"flex",gap:SP.md,alignItems:"flex-start"}}>
          <div style={{width:26,height:26,borderRadius:"50%",background:snrSig?B.success:allSig?B.navy:B.borderDark,display:"flex",alignItems:"center",justifyContent:"center",color:B.white,fontSize:11,fontWeight:700,flexShrink:0}}>2</div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:B.textPrimary,fontFamily:FF,marginBottom:2}}>Senior manager approval — full document</div>
            {!allSig?<div style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>Complete analyst sign-off first.</div>
            :snrSig?<div style={{fontSize:11,color:B.success,fontFamily:FF,fontWeight:600}}>✓ Approved by {snrSig.name} ({snrSig.role}) · {snrSig.at}</div>
            :<div style={{marginTop:SP.sm}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 180px",gap:SP.sm,marginBottom:SP.md}}>
                <div><Lbl c="Senior Manager Name"/><Inp value={snrName} onChange={setSnrName} placeholder="e.g. Adam Said"/></div>
                <div><Lbl c="Role"/><Sel value={snrRole} onChange={setSnrRole} opts={ROLES}/></div>
              </div>
              <Btn onClick={()=>{if(snrName.trim().length>1){const e={name:snrName.trim(),role:snrRole,at:nowStr()};setSnrSig(e);setAuditLog(l=>[...l,{ts:nowStr(),u:snrName.trim(),d:`Full report approved by ${snrName.trim()} (${snrRole}).`}]);}}} disabled={snrName.trim().length<2} v="primary">Sign off full document →</Btn>
            </div>}
          </div>
        </div>
      </div>
    </div>}

    {snrSig&&<div style={{background:B.successBg,border:`0.5px solid ${B.successBorder}`,borderRadius:10,padding:"18px 20px",marginBottom:SP.base}}>
      <div style={{fontSize:14,color:B.success,fontFamily:FF,fontWeight:700,marginBottom:SP.xs}}>Ready for export</div>
      <div style={{fontSize:12,color:B.success,fontFamily:FF,marginBottom:SP.md,lineHeight:1.6}}>
        Both approval levels complete. Export includes all section narratives, signoff records, and the full audit trail.<br/>
        <span style={{fontSize:11,opacity:0.75}}>Analyst: {user.name} · Senior: {snrSig.name} · {snrSig.at}</span>
      </div>
      <div style={{display:"flex",gap:SP.md,alignItems:"center"}}>
        <Btn onClick={doExport} v="primary" sz="lg">⬇ Export Report + Audit Log</Btn>
        <span style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>Exports as .txt</span>
      </div>
      {exported&&<div style={{marginTop:SP.md}}>
        <div style={{fontSize:12,color:B.success,fontFamily:FF,fontWeight:600,marginBottom:SP.sm}}>✓ Export complete — if the file didn't download automatically, copy the text below:</div>
        <textarea readOnly value={exported} rows={6} style={{width:"100%",boxSizing:"border-box",padding:"9px 11px",fontSize:11,fontFamily:"monospace",border:`0.5px solid ${B.successBorder}`,borderRadius:6,background:B.successBg,color:B.textPrimary,resize:"vertical"}}/>
      </div>}
    </div>}

    <div style={{marginTop:SP.sm}}>
      <Btn onClick={onBack} v="ghost" sz="lg">← Back to Review</Btn>
    </div>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════════════════
// LANDING — step 0
// ═══════════════════════════════════════════════════════════════════════════════
const LANDING_STEPS=[
  {num:"01",label:"Fund Config",    desc:"Fund identity, strategy, audience, tone and branding.",                                                          ai:false},
  {num:"02",label:"Data Intake",    desc:"Assets, debt, market context and financials. Upload CSV or PDF — Claude maps fields automatically.",             ai:true},
  {num:"03",label:"Report Structure",desc:"Section editor with presets, drag-to-reorder and named variants.",                                             ai:false},
  {num:"04",label:"Review & Flags", desc:"Analyst flags surface data gaps, covenant proximity and directional logic issues.",                              ai:false},
  {num:"05",label:"Generate & Export",desc:"Claude drafts each section. Confidence scores, approval workflow and audit log.",                             ai:true},
];
const LANDING_FEATURES=[
  {label:"Multi-file AI Upload",  desc:"Drop a valuation report, loan schedule and broker note — assign each to a data destination. Claude maps fields and flags gaps inline."},
  {label:"Live NAV bridge",       desc:"Closing NAV computed in real time from asset fair values, debt table and manual inputs. Preview updates as you type."},
  {label:"Analyst flag engine",   desc:"Automatic flags for short WALB, covenant proximity, sub-90% occupancy, unhedged debt and directional logic conflicts."},
  {label:"Approval workflow",     desc:"Session identity, per-flag resolution logging and a timestamped audit trail on every generated report."},
];
const LANDING_AI_BULLETS=["Section narrative drafting","Confidence scoring per section","Multi-file field mapping","Inline data gap flagging"];

function Landing({onStart}){
  const [hov,setHov]=useState(false);
  const mf={width:"100%",border:`0.5px solid ${B.border}`,borderRadius:6,padding:"8px 12px",fontSize:11,color:B.navy,background:B.white,fontFamily:FF};
  const mfSel={...mf,backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%235A6070'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center",paddingRight:28};
  const ml={fontSize:8,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:B.textSecondary,marginBottom:4,fontFamily:FF};
  const chip=(active)=>({padding:"6px 8px",borderRadius:5,fontSize:9,fontWeight:active?700:400,background:active?B.navy:"transparent",color:active?B.white:B.textSecondary,border:`0.5px solid ${active?B.navy:B.border}`,textAlign:"center"});
  return(
    <div style={{minHeight:"100vh",background:B.white,fontFamily:FF,display:"flex",flexDirection:"column"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>

      {/* Nav */}
      <header style={{background:B.navy,height:56,padding:"0 48px",display:"flex",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src="https://res.cloudinary.com/dsgfts9gp/image/upload/Gemini_Generated_Image_uao02uao02uao02u-remove-bg-io_mb5sys.png" alt="" style={{height:34,width:34,objectFit:"contain"}}/>
          <div style={{width:"0.5px",height:16,background:"rgba(255,255,255,0.15)"}}/>
          <span style={{fontSize:13,fontWeight:600,color:B.white,letterSpacing:"0.01em"}}>LP Report Generator</span>
          <div style={{width:4,height:4,borderRadius:"50%",background:B.terracotta}}/>
          <span style={{fontSize:9,fontWeight:600,letterSpacing:"0.09em",color:"rgba(255,255,255,0.3)",textTransform:"uppercase"}}>Fund Operations Tool</span>
        </div>
      </header>

      {/* Hero */}
      <div style={{background:B.navy,padding:"72px 48px 0",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        <div style={{fontSize:11,fontWeight:600,letterSpacing:"0.1em",color:"rgba(255,255,255,0.35)",textTransform:"uppercase",marginBottom:24}}>Fund Operations Tool</div>
        <h1 style={{fontSize:40,fontWeight:600,color:B.white,margin:"0 0 18px",letterSpacing:"-0.025em",lineHeight:1.15,maxWidth:600,fontFamily:FF}}>
          Quarterly LP reporting,<br/>built for real estate funds.
        </h1>
        <p style={{fontSize:15,color:"rgba(255,255,255,0.5)",margin:"0 0 24px",maxWidth:500,lineHeight:1.65,fontWeight:400}}>
          From data intake to final draft — validate assets, resolve flags, and generate section-level LP narratives with a full approval workflow.
        </p>

        {/* AI feature pills */}
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,marginBottom:32}}>
          {["Multi-file AI Upload","Section narrative drafting","Analyst flag engine","Confidence scoring"].map(p=>(
            <span key={p} style={{fontSize:11,color:"rgba(255,255,255,0.6)",background:"rgba(255,255,255,0.08)",border:"0.5px solid rgba(255,255,255,0.15)",padding:"5px 12px",borderRadius:20}}>✦ {p}</span>
          ))}
        </div>

        <button onClick={onStart} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
          style={{padding:"12px 28px",background:hov?"#A85520":"#C8692A",color:B.white,border:"none",borderRadius:8,fontSize:13,fontWeight:500,cursor:"pointer",letterSpacing:"0.01em",transition:"background 0.15s",fontFamily:FF,marginBottom:10}}
        >Get Started →</button>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.2)",marginBottom:48}}>Pre-populated with a sample European logistics fund</div>

        {/* Browser mock frame */}
        <div style={{width:"100%",maxWidth:960,borderRadius:"10px 10px 0 0",overflow:"hidden",boxShadow:"0 -4px 40px rgba(0,0,0,0.35)"}}>
          {/* Chrome bar */}
          <div style={{background:"#0c1e35",padding:"10px 14px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <div style={{width:11,height:11,borderRadius:"50%",background:"#FF5F57"}}/>
              <div style={{width:11,height:11,borderRadius:"50%",background:"#FEBC2E"}}/>
              <div style={{width:11,height:11,borderRadius:"50%",background:"#28C840"}}/>
            </div>
            <div style={{flex:1,background:"rgba(255,255,255,0.07)",borderRadius:5,padding:"5px 12px",fontSize:11,color:"rgba(255,255,255,0.35)",fontFamily:FF,textAlign:"center"}}>lp-report-generator.vercel.app</div>
            <div style={{width:52,flexShrink:0}}/>
          </div>

          {/* Viewport — fixed height, overflow hidden for hard crop */}
          <div style={{height:420,overflow:"hidden",background:B.offWhite}}>
            {/* Tool navbar */}
            <div style={{background:B.navy,height:44,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <img src="https://res.cloudinary.com/dsgfts9gp/image/upload/Gemini_Generated_Image_uao02uao02uao02u-remove-bg-io_mb5sys.png" alt="" style={{height:28,width:28,objectFit:"contain"}}/>
                <div style={{width:2,height:14,background:B.terracotta,borderRadius:2}}/>
                <span style={{fontSize:11,fontWeight:700,color:B.white,letterSpacing:"0.04em"}}>LP Report Generator</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:B.terracotta}}/>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>v0.5</span>
              </div>
            </div>

            {/* Step bar */}
            <div style={{background:B.offWhite,padding:"10px 24px",display:"flex",alignItems:"center"}}>
              {[["1","Fund Config",true],["2","Data Intake",false],["3","Report Structure",false],["4","Review & Flags",false],["5","Generate & Export",false]].map(([n,l,active],i)=>(
                <React.Fragment key={n}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:active?B.terracotta:"transparent",border:`2px solid ${active?B.terracotta:B.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:active?B.white:B.textMuted}}>{n}</div>
                    <span style={{fontSize:10,fontWeight:active?700:400,color:active?B.terracotta:B.textMuted,whiteSpace:"nowrap"}}>{l}</span>
                  </div>
                  {i<4&&<div style={{flex:1,height:"0.5px",background:B.border,margin:"0 10px"}}/>}
                </React.Fragment>
              ))}
            </div>

            {/* Content */}
            <div style={{padding:"0 16px"}}>
              <div style={{background:B.white,borderRadius:"10px 10px 0 0",border:`0.5px solid ${B.border}`,borderBottom:"none"}}>
                <div style={{padding:"16px 20px",borderBottom:`0.5px solid ${B.border}`}}>
                  <div style={{fontSize:15,fontWeight:700,color:B.navy,marginBottom:3}}>Fund Configuration</div>
                  <div style={{fontSize:11,color:B.textMuted}}>Configure fund parameters, reporting context and branding.</div>
                </div>
                {/* Fund Identity card */}
                <div style={{margin:"14px 20px",border:`0.5px solid ${B.border}`,borderRadius:10,overflow:"hidden"}}>
                  <div style={{background:B.offWhite,padding:"9px 14px",borderBottom:`0.5px solid ${B.border}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:B.navy}}>Fund Identity</div>
                  </div>
                  <div style={{padding:14}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:10}}>
                      <div><div style={ml}>Fund Name <span style={{color:B.danger}}>*</span></div><div style={mf}>Meridian European Logistics Fund II</div></div>
                      <div><div style={ml}>Reporting Period <span style={{color:B.danger}}>*</span></div><div style={mf}>Q3 2024</div></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px",marginBottom:10}}>
                      <div><div style={ml}>Strategy <span style={{color:B.danger}}>*</span></div><div style={mfSel}>Value-Add</div></div>
                      <div><div style={ml}>Fund Stage <span style={{color:B.danger}}>*</span></div><div style={mfSel}>Investment Period</div></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px 16px"}}>
                      <div><div style={ml}>Base Currency <span style={{color:B.danger}}>*</span></div><div style={mfSel}>EUR</div></div>
                      <div><div style={ml}>Reporting Date</div><div style={mf}>09/30/2024</div></div>
                    </div>
                  </div>
                </div>
                {/* Audience & Tone — partially visible at crop */}
                <div style={{margin:"0 20px 14px",border:`0.5px solid ${B.border}`,borderRadius:10,overflow:"hidden"}}>
                  <div style={{background:B.offWhite,padding:"9px 14px",borderBottom:`0.5px solid ${B.border}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:B.navy}}>Audience & Tone</div>
                  </div>
                  <div style={{padding:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                    <div>
                      <div style={{...ml,marginBottom:7}}>Target Audience <span style={{color:B.danger}}>*</span></div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                        <div style={chip(true)}>Institutional LP</div>
                        <div style={chip(false)}>Family Office</div>
                        <div style={chip(false)}>HNW / Private</div>
                        <div style={chip(false)}>Mixed LP Base</div>
                      </div>
                    </div>
                    <div>
                      <div style={{...ml,marginBottom:7}}>Tone <span style={{color:B.danger}}>*</span></div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                        <div style={chip(true)}>Formal & Precise</div>
                        <div style={chip(false)}>Narrative</div>
                        <div style={chip(false)}>Concise Factual</div>
                        <div style={chip(false)}>Cautious</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* no bottom border — bleeds into white steps section */}
        </div>
      </div>

      {/* Steps */}
      <div style={{background:B.white,padding:"80px 48px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.1em",color:"#aaaaaa",textTransform:"uppercase",marginBottom:48,textAlign:"center"}}>Five steps</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"0 32px"}}>
            {LANDING_STEPS.map(s=>(
              <div key={s.num}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <span style={{fontSize:11,fontWeight:500,color:B.terracotta,fontFamily:"monospace"}}>{s.num}</span>
                  {s.ai&&<span style={{fontSize:9,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",color:"#7A3A12",background:"#FBF0E9",padding:"2px 7px",borderRadius:20}}>AI</span>}
                </div>
                <div style={{borderTop:`0.5px solid ${B.border}`,paddingTop:20}}>
                  <div style={{fontSize:14,fontWeight:500,color:B.navy,marginBottom:10}}>{s.label}</div>
                  <div style={{fontSize:12,color:"#888888",lineHeight:1.65}}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{background:B.offWhite,padding:"64px 48px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{fontSize:10,fontWeight:600,letterSpacing:"0.1em",color:"#aaaaaa",textTransform:"uppercase",marginBottom:40,textAlign:"center"}}>What's inside</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"32px 64px"}}>
            {LANDING_FEATURES.map(f=>(
              <div key={f.label} style={{borderTop:`0.5px solid ${B.border}`,paddingTop:20}}>
                <div style={{fontSize:13,fontWeight:500,color:B.navy,marginBottom:6}}>{f.label}</div>
                <div style={{fontSize:13,color:"#888888",lineHeight:1.6}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{background:B.white,padding:"24px 48px",borderTop:`0.5px solid ${B.border}`}}>
        <div style={{fontSize:11,color:"#cccccc",textAlign:"center"}}>LP Report Generator · Fund Operations Tool · Built by Tomaso Portunato</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const [step,setStep]=useState(0);
  const [user,setUser]=useState(null);
  const [log,setLog]=useState([]);
  const [resolutions,setResolutions]=useState({});
  const [cfg,setCfg]=useState({
    fundName:"Meridian European Logistics Fund II",reportingPeriod:"Q3 2024",strategy:"Value-Add",
    fundStage:"Investment Period",currency:"EUR",reportingDate:"2024-09-30",
    audience:"institutional",tone:"formal",reportMode:"continuing",priorReport:null,
    branding:{logo:null,primaryFont:"DM Sans",colorPrimary:B.navy,colorSecondary:B.terracotta,colorAccent:"#4A90D9",disclaimer:"",terminology:[]},
  });
  const [assets,setAssets]=useState(DEFAULT_ASSETS);
  const [debt,setDebt]=useState(DEFAULT_DEBT);
  const [notes,setNotes]=useState({});
  const [mkt,setMkt]=useState({files:[],sources:[]});
  const [fin,setFin]=useState(DEFAULT_FIN);
  const [structure,setStructure]=useState({active:PRESETS["Standard"].map(id=>({id,parked:false}))});

  const confirmUser=u=>{setUser(u);setLog([{ts:nowStr(),u:u.name,d:`Session started by ${u.name} (${u.role}).`}]);};
  const titles=["Fund Configuration","Data Intake","Report Structure","Review & Flags","Generate & Export"];
  const subs=["Configure fund parameters, reporting context and branding.","Enter asset valuations, debt, market data and narrative context.","Define section order, apply presets and save named variants.","Resolve all analyst flags before generation is unlocked.","Generate, review with confidence scores, approve and export."];
  const flags=(()=>{try{return getFlags(assets,debt,mkt,structure,notes);}catch(_){return [];}})();

  return <div style={{minHeight:"100vh",background:B.offWhite,fontFamily:FF}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      ::placeholder { color: #9097A3; }
    `}</style>

    {/* Landing — step 0 */}
    {step===0&&<Landing onStart={()=>setStep(1)}/>}

    {/* App — steps 1–5 */}
    {step>0&&<>
    {/* Session gate */}
    {!user&&step>=4&&<SessionGate onConfirm={confirmUser}/>}

    {/* Top nav — navy background, white text, terracotta accent */}
    <div style={{background:B.navy,padding:"0 28px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${B.navyLight}`}}>
      <div style={{display:"flex",alignItems:"center",gap:SP.md}}>
        <img src="https://res.cloudinary.com/dsgfts9gp/image/upload/Gemini_Generated_Image_uao02uao02uao02u-remove-bg-io_mb5sys.png" alt="TP" style={{width:50,height:50,objectFit:"contain",filter:"brightness(0) invert(1)"}}/>
        <div style={{width:3,height:22,background:B.terracotta,borderRadius:2}}/>
        <span style={{color:B.white,fontSize:13,fontWeight:700,fontFamily:FF,letterSpacing:"0.04em"}}>LP Report Generator</span>
        {cfg.fundName&&<span style={{color:"#4A7ABF",fontSize:12,fontFamily:FF}}>/ {cfg.fundName}</span>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:SP.md}}>
        {user&&<span style={{fontSize:11,color:"#7A9BC2",fontFamily:FF}}>{user.name} · {user.role}</span>}
        <div style={{display:"flex",alignItems:"center",gap:SP.sm}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:B.terracotta}}/>
          <span style={{color:"#7A9BC2",fontSize:11,fontFamily:FF}}>v0.5</span>
        </div>
      </div>
    </div>

    {/* Main content */}
    <div style={{maxWidth:1000,margin:"0 auto",padding:`${SP.lg}px ${SP.base}px`}}>
      <StepBar cur={step}/>
      <div style={{background:B.white,borderRadius:12,border:`0.5px solid ${B.border}`,padding:`${SP.lg}px ${SP.lg}px`}}>
        <div style={{marginBottom:SP.lg,paddingBottom:SP.md,borderBottom:`0.5px solid ${B.border}`}}>
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:B.navy,fontFamily:FF}}>{titles[step-1]}</h2>
          <p style={{margin:`${SP.xs}px 0 0`,fontSize:13,color:B.textMuted,fontFamily:FF}}>{subs[step-1]}</p>
        </div>
        {step===1&&<Step1 cfg={cfg} setCfg={setCfg} onNext={()=>setStep(2)}/>}
        {step===2&&<Step2 assets={assets} setAssets={setAssets} debt={debt} setDebt={setDebt} notes={notes} setNotes={setNotes} mkt={mkt} setMkt={setMkt} fin={fin} setFin={setFin} onBack={()=>setStep(1)} onNext={()=>setStep(3)}/>}
        {step===3&&<Step3 structure={structure} setStructure={setStructure} onBack={()=>setStep(2)} onNext={()=>setStep(4)}/>}
        {step===4&&user&&<Step4 assets={assets} debt={debt} mkt={mkt} structure={structure} notes={notes} user={user} auditLog={log} setAuditLog={setLog} resolutions={resolutions} setResolutions={setResolutions} onBack={()=>setStep(3)} onNext={()=>setStep(5)}/>}
        {step===5&&user&&<Step5 cfg={cfg} assets={assets} debt={debt} notes={notes} mkt={mkt} structure={structure} user={user} resolutions={resolutions} flags={flags} auditLog={log} setAuditLog={setLog} onBack={()=>setStep(4)}/>}
        {step===5&&!user&&<div style={{textAlign:"center",padding:`${SP.xl}px 0`}}>
          <div style={{fontSize:13,color:B.textMuted,fontFamily:FF,marginBottom:SP.base}}>Session identity required for this step.</div>
          <Btn onClick={()=>setStep(4)} v="ghost" sz="lg">← Back to Review</Btn>
        </div>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:SP.md}}>
        <span style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>LP Report Generator · Session data not persisted</span>
        <span style={{fontSize:11,color:B.textMuted,fontFamily:FF}}>v0.5</span>
      </div>
    </div>
    </>}
  </div>;
}
