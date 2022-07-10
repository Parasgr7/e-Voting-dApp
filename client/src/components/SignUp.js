import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Card, Message } from 'semantic-ui-react';
import AuthenticationHash from '../utils/AuthenticationHash';
import "../App.css";
import LoadingAnimation from 'react-circle-loading-animation';

class SignUp extends Component {
    state = {
        username: '',
        password: '',
        digicode: '',
        alertMessage: '',
        status: '',
        signedUp: false,
        isloading:false
    }

    onSignUp = async () => {
        if (this.state.username !== '' && this.state.password !== '' && this.state.digicode !== '') {
            let username = this.state.username.trim();
            let password = this.state.password.trim();
            let digicode = this.state.digicode.trim();

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
                      alertMessage: "6 digit required for digicode",
                      status: 'failed',
                      digicode: ''
                  });
                  return
              }
              else
              {
                let userAddress = await this.props.contract.methods.getUserAddress().call({ from: this.props.account });

                if (userAddress !== '0x0000000000000000000000000000000000000000') {
                    this.setState({
                        alertMessage: 'This account already exists',
                        status: 'failed',
                        username: '',
                        password: '',
                        digicode: '',
                    });

                    return;
                } else {
                    this.setState({isloading: true});
                    let hash = await AuthenticationHash(username, this.props.account, password, digicode, this.props.web3);

                    await this.props.contract.methods.register(hash).send({ from: this.props.account }).then(()=>{
                      this.setState({isloading: false});
                    }).catch(e => {
                      if (e.code === 4001){
                         this.setState({isloading: false});
                         toast.error('Transaction Rejected!!!', {hideProgressBar: true,theme: "white"});
                      }
                      else if (e.code === -32603)
                      {
                        this.setState({isloading: false});
                        var error_msg = JSON.parse( e.message.split('\'')[1])["value"]["data"]["message"].split('revert')[1];
                       toast.error(error_msg, {hideProgressBar: true,theme: "white"});
                      }
                    });

                    this.setState({
                        username: '',
                        password: '',
                        digicode: '',
                        status: 'success',
                        alertMessage: "Signup successful",
                        signedUp: true
                    });

                    this.props.accountCreated(this.state.signedUp);
                    return;
                }
              }
        }

    }

    render() {
        return (
            <div className="sign-up">
                <LoadingAnimation isLoading={this.state.isloading} />
                <h1 className="header">Create an account</h1>
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
                                            console.log('')
                                }
                                <Form.Field>
                                    <input
                                        required
                                        type='text'
                                        placeholder='Username'
                                        value={this.state.username}
                                        autoComplete="username"
                                        onChange={e => this.setState({ username: e.target.value })}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <input
                                        required
                                        type='password'
                                        placeholder='Password'
                                        value={this.state.password}
                                        autoComplete="current-password"
                                        onChange={e => this.setState({ password: e.target.value })}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <input
                                        required
                                        type='text'
                                        placeholder='National Identification No. (6 Digits)'
                                        value={this.state.digicode}
                                        autoComplete="digicode"
                                        onChange={e => this.setState({ digicode: e.target.value })}
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <Button type='submit' primary fluid size='large' onClick={this.onSignUp}>
                                        Create account
                                    </Button>
                                </Form.Field>
                            </Form>
                        </Card.Content>
                    </Card>
                    <div className="signin-onUp">
                        Already have an account? <Link to='/sign-in'>Sign in</Link>
                    </div>
                </div>
            </div>
        );
    }
}

export default SignUp
