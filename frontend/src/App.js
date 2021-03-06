import React, { Component } from 'react';
import Routes from './Routes';
import Nav from './Nav';
import JoblyApi from './JoblyApi';
import Alert from './Alert';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: localStorage.getItem('token'),
      user: {},
      loaded: false,
      alert: ''
    };
  }

  async componentDidMount() {
    await this.updateToken();
  }

  setAlert = alert => {
    this.setState({ alert });
  };

  clearAlert = () => {
    this.setState({ alert: '' });
  };

  updateToken = async () => {
    let token = localStorage.getItem('token');
    if (token) {
      let decodeToken = token.split('.')[1];
      let { username } = JSON.parse(atob(decodeToken));
      let user = await JoblyApi.getUser(username);
      this.setState({ token, user, loaded: true });
      return true;
    } else {
      this.setState({ token: undefined, user: {}, loaded: true });
      return false;
    }
  };

  loginSignUp = async (formData, login) => {
    let token;
    if (login) {
      // User is trying to login
      token = await JoblyApi.loginUser(formData);
    } else {
      // User is trying to sign up
      token = await JoblyApi.signUpUser(formData);
    }
    localStorage.setItem('token', token);
    return this.updateToken();
  };

  editProfile = async (formData, confirmPassword) => {
    let username = this.state.user.username;
    let token = await JoblyApi.loginUser({
      username,
      password: confirmPassword
    });
    if (token) {
      await JoblyApi.updateUser(username, formData);
      return this.updateToken();
    }
    return false;
  };

  render() {
    return this.state.loaded ? (
      <div className="App">
        <Nav
          token={this.state.token}
          updateToken={this.updateToken}
          user={this.state.user}
        />
        <div className="d-flex justify-content-center">
          <Routes
            alert={this.setAlert}
            clearAlert={this.clearAlert}
            alertMsg={this.state.alert}
            token={this.state.token}
            user={this.state.user}
            loginSignUp={this.loginSignUp}
            editProfile={this.editProfile}
          />
        </div>
      </div>
    ) : (
      <div className="d-flex justify-content-center">
        <Alert message="Loading data!" classes="alert-primary" />
      </div>
    );
  }
}

export default App;
