import React, { Component } from 'react';
import { Card, Grid, Message, Button, Icon } from 'semantic-ui-react';
import LoadingAnimation from 'react-circle-loading-animation';
import '../App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class UserAccount extends Component {
  constructor() {
    super();
    this.state = {
      disable: false,
      buttonText: 'Register as Candidate',
      candidate_id: null ,
      approved: false,
      isloading:false
    }
  }
    componentDidMount = async () => {
      this.fetch_candidates();
    }

    fetch_candidates = async() => {
      var candidates_count = await this.props.contract.methods.candidatesCount().call({ from: this.props.account });
      for(var i=1; i<= candidates_count; i++ )
      {
        var candidate = await this.props.contract.methods.candidates(i).call({ from: this.props.account });
        if(this.props.username  === candidate.name)
        {
          this.setState({
            disable: true,
            buttonText: 'Candidate Approval Pending...',
            candidate_id: candidate.id,
            approved: candidate.approved});
            window.localStorage.setItem('userId', candidate.id );
          break;
        }
      }
    }

    registerCandidate = async () => {
      this.setState({isloading: true});
      await this.props.contract.methods.registerCandidate(this.props.username).send({ from: this.props.account, gas: '4700000' }).then((res) => {
        this.setState({disable: true, buttonText: "Candidate Approval Pending...",isloading: false });
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
    }
    render() {
        return (
            <div className='user-account'>
              <ToastContainer toastStyle={{ backgroundColor: "#4298d3" }}/>
              <LoadingAnimation isLoading={this.state.isloading} />
                <Grid centered stackable>
                  <h1 className="header">User Profile</h1>
                    <Grid.Row>
                        <Grid.Column>
                            <Card fluid>
                                <Card.Content>
                                    <Card.Header>{this.props.username+"@gmail.com"}</Card.Header>
                                    <Card.Meta>
                                        <strong>{this.state.approved ? "Candidate" : "Voter"}</strong>
                                    </Card.Meta>
                                    <Card.Description>
                                        <span className="name">Username: <b className="name"> {this.props.username} </b> </span>
                                        <br/><br/>
                                        {
                                          this.state.approved ?
                                          <Button color="green" size='large'> <Icon name="check"/>Approved</Button>
                                          :
                                          (<>
                                        <Button primary disabled={this.state.disable} size='large' onClick={this.registerCandidate}>{this.state.buttonText}</Button>
                                        </>)
                                        }
                                    </Card.Description>
                                </Card.Content>
                                <Card.Content extra>
                                    <Message size='mini'>
                                        {this.props.account}
                                    </Message>
                                </Card.Content>
                            </Card>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

            </div>
        );
    }
}

export default UserAccount;
