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
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const redirectPath =
    new URLSearchParams(location.search).get("redirect") || "/";

  // Backend URL
  const API_URL = "https://videoverse-content-platform.onrender.com/api";

  // ==============================
  // LOGIN
  // ==============================
  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Invalid email or password.");
        return;
      }

      // Save JWT token
      localStorage.setItem(
        "videoVerseToken",
        data.token
      );

      // Get logged-in user's details
      const meResponse = await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      const userData = await meResponse.json();

      if (!meResponse.ok) {
        alert(
          userData.message ||
            "Could not fetch user information."
        );
        return;
      }

      // Save current user
      localStorage.setItem(
        "videoVerseCurrentUser",
        JSON.stringify(userData)
      );

      // Tell other components that auth changed
      window.dispatchEvent(
        new Event("authUpdated")
      );

      alert("Login successful!");

      navigate(redirectPath);
    } catch (error) {
      console.error("Login error:", error);

      alert(
        "Unable to connect to the backend. Make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // REGISTER
  // ==============================
  const handleRegister = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to create account."
        );
        return;
      }

      /*
        Registration successful.

        Now login automatically using
        the same email and password.
      */

      const loginResponse = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const loginData =
        await loginResponse.json();

      if (!loginResponse.ok) {
        alert(
          "Account created successfully. Please login."
        );

        setIsLogin(true);
        setPassword("");

        return;
      }

      // Save JWT
      localStorage.setItem(
        "videoVerseToken",
        loginData.token
      );

      // Get current user
      const meResponse = await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${loginData.token}`,
          },
        }
      );

      const userData = await meResponse.json();

      if (!meResponse.ok) {
        alert(
          "Account created, but user information could not be loaded."
        );
        return;
      }

      // Save current user
      localStorage.setItem(
        "videoVerseCurrentUser",
        JSON.stringify(userData)
      );

      window.dispatchEvent(
        new Event("authUpdated")
      );

      alert("Account created successfully!");

      navigate(redirectPath);
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      alert(
        "Unable to connect to the backend. Make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // FORM SUBMIT
  // ==============================
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      alert(
        "Please enter your email and password."
      );
      return;
    }

    if (!isLogin && !name) {
      alert("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      alert(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (isLogin) {
      await handleLogin();
    } else {
      await handleRegister();
    }
  };

  // ==============================
  // FORGOT PASSWORD
  // ==============================
  const handleForgotPassword = () => {
    alert(
      "Password reset will be added in a later backend step."
    );
  };

  // ==============================
  // SWITCH LOGIN / REGISTER
  // ==============================
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
            <Play
              size={20}
              fill="currentColor"
            />
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
                onClick={
                  handleForgotPassword
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
            disabled={loading}
          >

            <span>
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </span>

            {!loading && (
              <ArrowRight size={19} />
            )}

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
          By continuing, you agree to use
          VideoVerse responsibly.
        </p>

      </div>

    </div>
  );
}

export default Auth;