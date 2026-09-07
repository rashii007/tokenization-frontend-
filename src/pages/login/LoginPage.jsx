import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { Button } from "primereact/button";
import "./LoginPage.css";
import logo from "../../assets/images/logo.png";
import RaastLogo from "../../assets/images/Raast-logo.png";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigation = useNavigate();

  const [UserName, setName] = useState("");
  const [password, setPassword] = useState("");

  function handleName(event) {
    setName(event.target.value);
  }

  function handlePassword(event) {
    setPassword(event.target.value);
  }

  function handleLogin(event) {
    event.preventDefault();

    if (!UserName || !password) {
      alert("Please fill all fields");
      return;
    }

    if (UserName === "superadmin" && password === "admin123") {
      localStorage.setItem("token", "superadmin-token");

      localStorage.setItem("name", "superadmin");

      navigation("/dashboard");
    } else {
      alert("Invalid username or password");
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <header className="login-header">
          {/* =========================
              LOGO
          ========================= */}
          <div className="login-logo-box">
            {/* Mindcraft Logo */}
            <img src={logo} alt="Mindcraft" className="login-logo" />

            {/* RAAST Logo */}
            <div className="login-logo-divider" />

            <img src={RaastLogo} alt="RAAST" className="login-raast-logo" />
          </div>

          <h1 className="login-title">Raast Token Vault Management System</h1>

          <h2 className="login-subtitle">Login to Your Account</h2>
        </header>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-field">
            <label htmlFor="username" className="login-label">
              Username
            </label>

            <InputText
              id="username"
              placeholder="Enter Username"
              className="login-input"
              value={UserName}
              onChange={handleName}
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Password
            </label>

            <InputText
              id="password"
              placeholder="Enter Your Password"
              type="password"
              value={password}
              onChange={handlePassword}
              className="login-input"
            />
          </div>

          <Button
            type="submit"
            label="Login"
            icon="pi pi-sign-in"
            iconPos="right"
            className="login-button"
          />
        </form>
      </div>
    </div>
  );
}
