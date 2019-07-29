import SignIn from './pages/SignIn';
import VideoGrid from './pages/VideoGrid';
import React from "react";
import {BrowserRouter as Router, Redirect, Route} from "react-router-dom";
import {isAuthenticated} from './authenticate';

////////////////////////////////////////////////////////////
// 1. Click the public page
// 2. Click the protected page
// 3. Log in
// 4. Click the back button, note the URL each time

function AuthExample() {
  return (
    <Router>
      <div>
        <Route exact path="/login" component={SignIn} />
        <PrivateRoute exact path="/videos" component={VideoGrid} />
        <PrivateRoute exact path="/" component={VideoGrid}/>
      </div>
    </Router>
  );
}

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
}

export default AuthExample;