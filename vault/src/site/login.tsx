import { useState, type FormEvent } from "react";
import { useVault, signIn } from "../state/store";

export function Login() {
  const data = useVault();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email || email.indexOf("@") < 1) {
      setError("Enter the email address on your account.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setError("");
    signIn();
    location.hash = "portal";
  }

  return (
    <div className="view active">
      <div className="login-wrap">
        <form className="login-card" onSubmit={submit} noValidate>
          <h1>Client login</h1>
          <p>Sign in to see your family’s trusts, documents and deadlines.</p>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" placeholder="you@family.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="pw">Password</label>
          <input id="pw" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="err" role="alert">
            {error}
          </div>
          <button className="btn btn-dark" type="submit" style={{ width: "100%" }}>
            Sign in
          </button>
          <button
            className="btn btn-line demo"
            type="button"
            onClick={() => {
              setEmail(data.profile.email);
              setPassword("demo-demo");
              setError("");
              signIn();
              location.hash = "portal";
            }}
          >
            Use the demo account
          </button>
          <p className="secure">Demo only. Any email and password will sign you in.</p>
        </form>
      </div>
    </div>
  );
}
