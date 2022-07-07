import React, { Component } from 'react';
import { Card, Grid, Button, Input, Message } from 'semantic-ui-react';
import '../App.css';
import CountdownTimer from './CountdownTimer';
import LoadingAnimation from 'react-circle-loading-animation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


class Admin extends Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      candidate_id: null ,
      candidates_count: 0,
      unapproved_candidates: [],
      approved_candidates: [],
      color: 'blue',
      startTime: 1,
      endTime: 1,
      votingProcess: false,
      votingTimePeriod: 1,
      isloading:false,
      dateNow: Math.floor((new Date().getTime())/1000)
    }

  }
    componentDidMount = async () => {
      this._isMounted = true;
      this.fetch_candidates_data();
      this.interval = setInterval(() => this.setState({dateNow : Math.floor((new Date().getTime())/1000)}), 1000);

    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    fetch_candidates_data = async() => {
        var candidates_count = await this.props.contract.methods.candidatesCount().call({ from: this.props.account });
        var startTime = await this.props.contract.methods.startTime().call({ from: this.props.account });
        var endTime = await this.props.contract.methods.endTime().call({ from: this.props.account });
        var votingProcess = await this.props.contract.methods.votingProcess().call({ from: this.props.account });

        this.setState({
          candidates_count: Number(candidates_count),
          startTime: Number(startTime),
          endTime: Number(endTime),
          votingProcess: votingProcess
        });

        var arr = [];
        var approved_arr = [];
        for(var i=1; i<= this.state.candidates_count; i++ )
        {
          var candidate = await this.props.contract.methods.candidates(i).call({ from: this.props.account });
          if(!candidate.approved)
          {
            arr.push(candidate);
          }
          else{
            approved_arr.push(candidate)
          }
        }
        this.setState({unapproved_candidates: arr,approved_candidates: approved_arr });
    }

    approve= async (event) => {
        this.setState({isloading: true});
        event.persist();
        await this.props.contract.methods.approve(event.target.id).send({ from: this.props.account }).then((tx)=>{
          console.log(tx);
          this.setState({isloading: false});
          event.target.innerText = "Approved";
          event.target.disabled = 1;
          event.target.style.background = "green";
        }).catch(e => {
          if (e.code === 4001){
             this.setState({isloading: false});
             toast.error('Transaction Rejected!!!', {hideProgressBar: true,theme: "white"});
          }
          else if (e.code === -32603)
          {
            this.setState({isloading: false});
            toast.error('Metamask Error!!!', {hideProgressBar: true,theme: "white"});
          }
        });


    }

    startVoting = async()=> {
      this.setState({isloading: true});
      await this.props.contract.methods.startVote(this.state.votingTimePeriod).send({ from: this.props.account }).then(()=>{
        this.setState({isloading: false});
      }).catch(e => {
        if (e.code === 4001){
           this.setState({isloading: false});
           toast.error('Transaction Rejected!!!', {hideProgressBar: true,theme: "white"});
        }
        else if (e.code === -32603)
        {
          this.setState({isloading: false});
          toast.error('Metamask Error!!!', {hideProgressBar: true,theme: "white"});
        }
      });
      var endTime = await this.props.contract.methods.endTime().call({ from: this.props.account });

      this.setState({votingProcess: true, endTime: endTime});
      console.log(this.state);
    }

    stopVoting = async()=> {
      this.setState({isloading: true});
      await this.props.contract.methods.stopVote().send({ from: this.props.account }).then(()=>{
        this.setState({isloading: false,votingProcess: false});
      }).catch(e => {
        if (e.code === 4001){
           this.setState({isloading: false});
           toast.error('Transaction Rejected!!!', {hideProgressBar: true,theme: "white"});
        }
        else if (e.code === -32603)
        {
          this.setState({isloading: false});
          toast.error('Metamask Error!!!', {hideProgressBar: true,theme: "white"});
        }
      });
    }

    handleInputChange = e => {
      this.setState({ votingTimePeriod: e.target.value });
    };

    render() {
        return (
            <div className='user-account'>
              <ToastContainer toastStyle={{ backgroundColor: "#327F94" }}/>
              <LoadingAnimation isLoading={this.state.isloading} />
              <Grid stackable>
                <Grid.Row centered>
                  <Grid.Column className="textCenter">
                    {this.state.unapproved_candidates.length ===0 ? <h1 className="header">No Pending Candidates</h1> : <h1 className="header">Pending Candidates</h1>}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                {
                  (<>
                  <Grid columns={this.state.unapproved_candidates.length <= 3 ? this.state.unapproved_candidates.length : 4} divided>

                    {
                      (this.state.endTime === 0 && this.state.startTime === 0 && !this.state.votingProcess && this.state.approved_candidates.length >= 2) ?
                        <Grid.Row centered>
                          <Grid.Column className="textCenter">
                            <Input action={{
                                color: 'teal',
                                labelPosition: 'left',
                                icon: 'clock outline',
                                content: 'Start Voting',
                                onClick: () => this.startVoting()
                              }}
                            onChange={this.handleInputChange}
                            actionPosition='left'
                            defaultValue={this.state.votingTimePeriod}
                            placeholder='Time period (mins)'
                            />
                          </Grid.Column>
                        </Grid.Row>
                      :
                      (
                          <>
                            {
                                ((this.state.dateNow > this.state.endTime) && this.state.votingProcess)?
                              (

                                <>
                                <Grid.Row centered>
                                  <Grid.Column className="textCenter">
                                    <Button color='red' size="large" onClick={this.stopVoting}>End Election</Button>
                                  </Grid.Column>
                                </Grid.Row>
                                </>
                              )
                              :
                              (
                                  <>
                                    <Grid.Row centered>
                                      <Grid.Column>
                                        <CountdownTimer targetDate={this.state.endTime} votingProcess={this.state.votingProcess} />
                                      </Grid.Column>
                                    </Grid.Row>
                                  </>
                              )
                            }
                          </>
                        )
                      }
                      <Grid.Row>
                      {
                          (
                            this.state.unapproved_candidates.map((candidate, index) => {
                              return(
                                <>
                                  <Grid.Column key={index} className="pads">
                                      <Card fluid>
                                          <Card.Content>
                                              <Card.Header>{candidate.name}</Card.Header>
                                              <Card.Meta>
                                                  <strong>{candidate.approved ? "Candidate" : "Voter"}</strong>
                                              </Card.Meta>
                                              <Card.Description>
                                                  <span className="name">Username: <b className="name"> {candidate.name} </b> </span>
                                                  <br/><br/>
                                                  <Button id={candidate.id} color="blue" size='large' onClick={(e) => this.approve(e)}>Approve</Button>
                                              </Card.Description>
                                          </Card.Content>
                                          <Card.Content extra>
                                              <Message size='mini'>
                                                  {candidate.candidate_address}
                                              </Message>
                                          </Card.Content>
                                      </Card>
                                  </Grid.Column>
                                </>
                              )
                              })
                          )

                        }

                      </Grid.Row>
                    </Grid>
                      </>
                    )
                 }
               </Grid.Row>
             </Grid>
        </div>
        );
    }
}

export default Admin;
