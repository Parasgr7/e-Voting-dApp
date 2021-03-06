import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Card, Message } from 'semantic-ui-react';
import AuthValidation from '../utils/AuthValidation';
import "../App.css";
import LoadingAnimation from 'react-circle-loading-animation';

class SignIn extends Component {
    state = {
        username: '',
        password: '',
        digicode: '',
        alertMessage: '',
        status: '',
        loggedIn: false,
        isloading:false
    }

    onSignIn = async () => {

        if (this.state.username !== '' && this.state.password !== '' && this.state.digicode !== '') {
            let username = this.state.username.trim();
            let password = this.state.password.trim();
            let digicode = this.state.digicode.trim();

            let usernameToSend = username;

            if (password.length < 8)
            {
                this.setState({
                    alertMessage: "at least 8 characters for password",
                    status: 'failed',
                    password: '',
                    digicode: '',
                });
                return;
            }
             if (digicode.length !== 6)
             {
                this.setState({
                    alertMessage: "National Identification No. (6 Digits)",
                    status: 'failed',
                    digicode: ''
                });
                return
              }
            else
            {
                let userAddress = await this.props.contract.methods.getUserAddress().call({ from: this.props.account });

                if (userAddress === '0x0000000000000000000000000000000000000000') {
                    this.setState({
                        alertMessage: 'Account does not exists',
                        status: 'failed',
                        username: '',
                        password: '',
                        digicode: '',
                    });
                    return;
                } else {
                    this.setState({isloading: true});
                    let validated = await
                        AuthValidation(
                            username,
                            this.props.account,
                            password, digicode,
                            this.props.web3,
                            this.props.contract
                        );

                    if (!validated) {
                        this.setState({
                            alertMessage: 'Incorrect log in',
                            status: 'failed',
                            username: '',
                            password: '',
                            digicode: '',
                            isloading: false
                        });
                        return
                    } else {
                        this.setState({
                            username: '',
                            password: '',
                            digicode: '',
                            status: 'success',
                            alertMessage: "Sign in successful",
                            loggedIn: true,
                            isloading: false
                        });

                        this.props.userSignedIn(
                            this.state.loggedIn,
                            usernameToSend
                        );

                        return;
                    }
                }
            }
        }


        this.setState({
            username: '',
            password: '',
            digicode: ''
        })
    }
    render() {
        return (
            <div className="sign-up">
              <LoadingAnimation isLoading={this.state.isloading} />
                <h1 className="header">Sign in to your account</h1>
                <div className='signup-form'>
                    <Card fluid centered>
                        <Card.Content>
                            <Form size='large'>
                                {
                                    this.state.alertMessage !== '' && this.state.status === 'failed' ?
                                        <Message negative>
                                            {this.state.alertMessage}
                                        </Message> :
                                        this.state.alertMessage !== '' && this.state.status === 'success' ?
                                            <Message positive>
                                                {this.state.alertMessage}
                                            </Message> :
                                            null
                                }
                                <Form.Field required>
                                    <input
                                        type='text'
                                        placeholder='Username'
                                        value={this.state.username}
                                        autoComplete="username"
                                        onChange={e => this.setState({ username: e.target.value })}
                                    />
                                </Form.Field>
                                <Form.Field required>
                                    <input
                                        type='password'
                                        placeholder='Password'
                                        value={this.state.password}
                                        autoComplete="current-password"
                                        onChange={e => this.setState({ password: e.target.value })}
                                    />
                                </Form.Field>
                                <Form.Field required>
                                    <input
                                        type='text'
                                        placeholder='National Identification No. (6 Digits)'
                                        value={this.state.digicode}
                                        autoComplete="digicode"
                                        onChange={e => this.setState({ digicode: e.target.value })}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <Button type='submit' primary fluid size='large' onClick={this.onSignIn}>
                                        Sign in
                                    </Button>
                                </Form.Field>

                            </Form>
                        </Card.Content>
                    </Card>
                    {
                        this.props.signedUp ?
                            null :
                            <div className="signin-onUp">
                                Don't have an account? <Link to='/e-Voting-dApp/sign-up'>Sign up</Link>
                            </div>
                    }
                </div>
            </div>
        );
    }
}

export default SignIn
