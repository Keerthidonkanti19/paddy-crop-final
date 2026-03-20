import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Login(){
  const { login } = useContext(AuthContext);
  const [name, setName] = useState("");
  const nav = useNavigate();

  const handle = async () => {
    const trimmed = name.trim();
    if(!trimmed || !trimmed.includes(" ")) return alert("Enter first and surname");
    await login(trimmed);
    nav("/");
  };

  return (
    <div className="hero">
      <div className="container">
        <h1>Login</h1>
        <div className="form-card">
          <div style={{marginBottom:12}}>
            <label className="kicker">Full name</label>
            <input className="input" placeholder="Ravi Kumar" value={name} onChange={(e)=>setName(e.target.value)}/>
          </div>
          <button className="btn" onClick={handle}>Continue</button>
          <p style={{color:"var(--muted)", marginTop:12}}>Your name is used as a unique id — no password required.</p>
        </div>
      </div>
    </div>
  )
}
