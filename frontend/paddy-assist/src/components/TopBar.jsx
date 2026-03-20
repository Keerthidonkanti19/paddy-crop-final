// src/components/TopBar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function TopBar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="topbar" role="navigation">
      <div className="brand">PaddyAssist</div>

      <div style={{display:"flex", gap:18, alignItems:"center"}}>
        <Link to="/" style={{color:"#fff", textDecoration:"none"}}>Home</Link>
        <Link to="/profile" style={{color:"#fff", textDecoration:"none"}}>Profile</Link>

        {/* Profile avatar (right) */}
        <div style={{display:"flex", alignItems:"center", gap:12}}>
          {user && (
            <div
              title={user.full_name}
              style={{
                width:36,
                height:36,
                borderRadius:12,
                background:"#fff",
                display:"inline-flex",
                alignItems:"center",
                justifyContent:"center",
                color:"#0f5ea8",
                fontWeight:700,
              }}
            >
              {user.full_name ? user.full_name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase() : "U"}
            </div>
          )}

          {user ? (
            <button onClick={logout} style={{background:"transparent", border:"1px solid rgba(255,255,255,.18)", color:"#fff", padding:"8px 12px", borderRadius:10}}>Logout</button>
          ) : (
            <Link to="/login" style={{color:"#fff"}}>Login</Link>
          )}
        </div>
      </div>
    </div>
  );
}
