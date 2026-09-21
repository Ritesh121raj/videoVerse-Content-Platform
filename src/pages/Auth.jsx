import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Play,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const users =
      JSON.parse(localStorage.getItem("videoVerseUsers")) || [];

    if (isLogin) {
      const existingUser = users.find(
        (user) =>
          user.email.toLowerCase() === email.toLowerCase() &&
          user.password === password
      );

      if (!existingUser) {
        alert("Invalid email or password.");
        return;
      }

      localStorage.setItem(
        "videoVerseCurrentUser",
        JSON.stringify(existingUser)
      );

      window.dispatchEvent(new Event("authUpdated"));

      alert("Login successful!");
      navigate("/");
      return;
    }

    const userAlreadyExists = users.some(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase()
    );

    if (userAlreadyExists) {
      alert("An account with this email already exists.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
    };

    users.push(newUser);

    localStorage.setItem(
      "videoVerseUsers",
      JSON.stringify(users)
    );

    localStorage.setItem(
      "videoVerseCurrentUser",
      JSON.stringify(newUser)
    );

    window.dispatchEvent(new Event("authUpdated"));

    alert("Account created successfully!");
    navigate("/");
  };

  const switchAuthMode = () => {
    setIsLogin((previous) => !previous);
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <div className="auth-page">

      {/* Background decoration */}
      <div className="auth-background-circle auth-circle-one"></div>
      <div className="auth-background-circle auth-circle-two"></div>

      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Play size={20} fill="currentColor" />
          </div>

          <span>VideoVerse</span>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1>
            {isLogin
              ? "Welcome back!"
              : "Create your account"}
          </h1>

          <p>
            {isLogin
              ? "Sign in to continue watching your favorite content."
              : "Join VideoVerse and personalize your video experience."}
          </p>
        </div>

        {/* Form */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* Name */}
          {!isLogin && (
            <div className="auth-field">

              <label>Full name</label>

              <div className="auth-input-wrapper">
                <User size={19} />

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />
              </div>

            </div>
          )}

          {/* Email */}
          <div className="auth-field">

            <label>Email address</label>

            <div className="auth-input-wrapper">
              <Mail size={19} />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

          </div>

          {/* Password */}
          <div className="auth-field">

            <label>Password</label>

            <div className="auth-input-wrapper">
              <Lock size={19} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

          </div>

          {/* Forgot password */}
          {isLogin && (
            <div className="auth-forgot">
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Password reset feature coming soon."
                  )
                }
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit-btn"
          >
            <span>
              {isLogin
                ? "Sign In"
                : "Create Account"}
            </span>

            <ArrowRight size={19} />
          </button>

        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Switch login/signup */}
        <div className="auth-switch">

          <span>
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button
            type="button"
            onClick={switchAuthMode}
          >
            {isLogin
              ? "Create account"
              : "Sign in"}
          </button>

        </div>

        {/* Footer */}
        <p className="auth-footer">
          By continuing, you agree to use VideoVerse
          responsibly.
        </p>

      </div>
    </div>
  );
}

export default Auth;