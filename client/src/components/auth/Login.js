import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("success");
  };

  return (
    <>
      <h1>Sign In</h1>
      <p>
        <i className="fas fa-user" /> Sign In to your account
      </p>

      <form onSubmit={(e) => handleSubmit(e)}>
        <div>
          <input
            type="text"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={(e) => handleChange(e)}
            required
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            name="password"
            minLength="6"
            value={password}
            onChange={(e) => handleChange(e)}
          />
        </div>

        <input type="submit" value="Login" />
      </form>
      <p>
        Don't have an account?
        <Link to="/register">Sign Up </Link>
      </p>
    </>
  );
};

export default Login;
