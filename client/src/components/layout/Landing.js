import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <section>
      <div>
        <div>
          <h1>Developer connect</h1>
          <p>
            Create a developer profile/resume and portfolio, share post and
            network.
          </p>
          <div>
            <Link to="/register">Sign Up</Link>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Landing;
