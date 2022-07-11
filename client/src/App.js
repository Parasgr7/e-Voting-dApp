import React, { Component } from "react";
import web3Connection from './web3Connection';
import Contract from './Contract';
import Election from './Election';
import 'semantic-ui-css/semantic.min.css'
import { Menu, Divider } from "semantic-ui-react";
import { BrowserRouter, Switch, Route, Link, Redirect } from 'react-router-dom';
import Home from './components/Home';
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn"
import SignOut from "./components/SignOut";
import UserAccount from './components/UserAccount';
import Admin from './components/Admin';
import Voting from './components/Voting';
import "./App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      web3: null,
      account: null,
      admin_address: null,
      auth_contract: null,
      election_contract: null,
      balance: null,
      activeItem: 'home',
      signedUp: false,
      loggedIn: window.localStorage.getItem('loggedIn') || false ,
      username: window.localStorage.getItem('username') || ''
    };
  }


  handleItemClick = (e, { name }) => {this.setState({ activeItem: name });}

  componentDidMount = async () => {
    try {
      const web3 = await web3Connection();
      const auth_contract = await Contract(web3);
      const election_contract = await Election(web3);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const admin_address_upper = await election_contract.methods.contract_owner().call({ from: accounts[0].toLowerCase()});
      const admin_address = admin_address_upper.toLowerCase();

      this.setState({ web3, auth_contract, election_contract, account: accounts[0], admin_address }, this.start);

    } catch (error) {
      alert(
        `Failed to load web3`,
      );
      console.error(error);
    }

    await this.getAccount();
  };

  start = async () => {
    await this.getAccount();
    const { web3, auth_contract, election_contract, account, admin_address } = this.state;
  };

  getAccount = async () => {
    if (this.state.web3 !== null || this.state.web3 !== undefined) {
      await window.ethereum.on('accountsChanged', async (accounts) => {
        this.setState({
          account: accounts[0],
          loggedIn: false
        });
        window.localStorage.removeItem('loggedIn');
        window.localStorage.removeItem('username');

        // this.state.web3.eth.getBalance(accounts[0], (err, balance) => {
        //   if (!err) {
        //     this.setState({ balance: Formate(this.state.web3.utils.fromWei(balance, 'ether')) });
        //   }
        // });
      });
    }
  }

  accountCreated = async (signedUp) => {
    this.setState({ signedUp });
  }

  userSignedIn = async (loggedIn, username) => {
    this.setState({ loggedIn, username });
    window.localStorage.setItem('loggedIn', loggedIn );
    window.localStorage.setItem('username', username );

  }

  loggedOut = async (loggedIn) => {
    this.setState({loggedIn});
    window.localStorage.removeItem('loggedIn');
    window.localStorage.removeItem('username');
    window.localStorage.removeItem('userId' );
  }

  render() {
    const { activeItem, color } = this.state;

    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="main-page">
          <BrowserRouter>
            <div className="home-nav">
              <Menu inverted secondary size='large'>

                {
                  this.state.loggedIn ?
                    (
                      <>
                        <Menu.Item
                          name='home'
                          color={color}
                          active={activeItem === 'home'}
                          onClick={this.handleItemClick}
                          as={Link}
                          to='/'
                        />
                        {(this.state.admin_address === this.state.account) ?
                          <Menu.Item
                            name='admin'
                            color={color}
                            active={activeItem === 'admin'}
                            onClick={this.handleItemClick}
                            as={Link}
                            to='/admin'
                          />:
                          null
                        }
                        <Menu.Item
                          name='cast vote'
                          color={color}
                          active={activeItem === 'cast vote'}
                          onClick={this.handleItemClick}
                          as={Link}
                          to='/vote'
                        />
                      <Menu.Menu position='right'>
                        <Menu.Item
                          position='right'
                          name='user account'
                          color={color}
                          active={activeItem === 'user account'}
                          onClick={this.handleItemClick}
                          as={Link}
                          to='/user-account'
                        />
                        <Menu.Item
                          position='right'
                          name='sign out'
                          color='red'
                          active={activeItem === 'sign out'}
                          onClick={this.handleItemClick}
                          as={Link}
                          to='/sign-out'
                        />
                      </Menu.Menu>
                      </>
                      )
                    :
                    (
                      <>
                        <Menu.Item
                          name='home'
                          color={color}
                          active={activeItem === 'home'}
                          onClick={this.handleItemClick}
                          as={Link}
                          to='/'
                        />
                      <Menu.Menu position='right'>
                        <Menu.Item
                          position='right'
                          name='sign in'
                          color={color}
                          active={activeItem === 'sign in'}
                          onClick={this.handleItemClick}
                          as={Link}
                          to='/sign-in'
                        />
                        <Menu.Item
                          position='right'
                          name='sign up'
                          color={color}
                          active={activeItem === 'sign up'}
                          onClick={this.handleItemClick}
                          as={Link}
                          to='/sign-up'
                        />
                      </Menu.Menu>
                      </>
                    )
                }
              </Menu>
            </div>

            <Divider inverted />
            <Switch>
              {
                <Route path='/sign-in' >
                  {
                    this.state.loggedIn ?
                      <Redirect to='/user-account' />
                      :
                      <SignIn
                        web3={this.state.web3}
                        contract={this.state.auth_contract}
                        account={this.state.account}
                        signedUp={this.state.signedUp}
                        userSignedIn={this.userSignedIn}
                      />
                  }
                </Route>
              }
              {
                <Route path='/sign-up' >
                  {
                    this.state.loggedIn ?
                      <Redirect to='/user-account' />
                      :
                      <SignUp
                        web3={this.state.web3}
                        contract={this.state.auth_contract}
                        account={this.state.account}
                        accountCreated={this.accountCreated}
                      />
                  }
                </Route>
              }
              {
                  this.state.loggedIn ?
                  (
                    <>
                      <Route exact path='/' >
                        <Home />
                      </Route>
                      <Route path='/sign-out'>
                        <SignOut
                          loggedOut={this.loggedOut}
                        />
                        You've been logged out
                        <br></br>
                        Thank you
                      </Route>
                      <Route path='/user-account' >
                        <UserAccount
                          account={this.state.account}
                          username={this.state.username}
                          contract={this.state.election_contract}
                        />
                      </Route>
                      {
                        this.state.admin_address === this.state.account ?
                        <Route path='/admin' >
                          <Admin
                            account={this.state.account}
                            username={this.state.username}
                            contract={this.state.election_contract}
                          />
                        </Route>
                        :
                        null
                      }
                      <Route path='/vote' >
                        <Voting
                          account={this.state.account}
                          username={this.state.username}
                          contract={this.state.election_contract}
                        />
                      </Route>
                    </>
                  )
                  :
                  (
                    <>
                      <Route exact path='/' >
                        <Home />
                      </Route>
                      <Route path='/sign-out'>
                        <SignOut loggedOut={this.loggedOut}/>
                      </Route>
                      <Route path='/user-account'>
                        <h1 className="header">You have been logged out</h1>
                      </Route>
                      <Route path='/admin'>
                        <h1 className="header">You have been logged out</h1>
                      </Route>
                      <Route path='/vote'>
                        <h1 className="header">You have been logged out</h1>
                      </Route>
                    </>
                  )
              }

            </Switch>
          </BrowserRouter>
        </div>
      </div>
    );
  }
}

export default App;
