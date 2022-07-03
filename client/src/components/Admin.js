import React, { Component } from 'react';
import { Card, Grid, Image, Button, Input } from 'semantic-ui-react';
import '../App.css';
import CountdownTimer from './CountdownTimer';


class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      candidate_id: null ,
      candidates_count: 0,
      unapproved_candidates: [],
      color: 'blue',
      startTime: 1,
      endTime: 1,
      votingProcess: false,
      votingTimePeriod: 1
    }

  }
    componentDidMount = async () => {
      this.fetch_candidates_data();
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
        for(var i=1; i<= this.state.candidates_count; i++ )
        {
          var candidate = await this.props.contract.methods.candidates(i).call({ from: this.props.account });
          if(!candidate.approved)
          {
            arr.push(candidate);
          }
        }
        this.setState({unapproved_candidates: arr});
    }

    approve= async (event) => {
        event.persist();
        await this.props.contract.methods.approve(event.target.id).send({ from: this.props.account });
        event.target.innerText = "Approved";
        event.target.disabled = 1;
        event.target.style.background = "green";
    }

    startVoting = async()=> {
      await this.props.contract.methods.startVote(this.state.votingTimePeriod).send({ from: this.props.account });
    }

    stopVoting = async()=> {
      await this.props.contract.methods.stopVote().send({ from: this.props.account });
    }

    handleInputChange = e => {
      this.setState({ votingTimePeriod: e.target.value });
    };

    render() {
        return (
            <div className='user-account'>
            {(this.state.unapproved_candidates.length === 0 )?
              (
              <div>
                <h1>No pending candidate</h1>
                <br/><br/>
                {
                  (this.state.endTime === 0 && this.state.startTime === 0 && !this.state.votingProcess && this.state.candidates_count) ?
                  (
                    <>
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
                    </>

                  )
                  :
                  (
                    <>
                    {  ((Math.floor(Date.now()/1000) > this.state.endTime) && this.state.votingProcess)?
                      (
                        <>
                        <Button inverted color='red' onClick={this.stopVoting}>Stop Voting</Button>
                        </>
                      )
                      :
                      (
                          <>
                            <CountdownTimer targetDate={this.state.endTime} votingProcess={this.state.votingProcess} />
                          </>
                      )
                    }
                    </>
                  )
                }
              </div>
            )
              :
              (<>
              <Grid columns={this.state.unapproved_candidates.length} divided>
                  <Grid.Row>

                  {
                    this.state.unapproved_candidates.map((candidate, index) => {
                      return(
                      <Grid.Column key={index}>
                          <Card>
                              <Image
                                  src='https://react.semantic-ui.com/images/avatar/large/steve.jpg'
                                  wrapped ui={false}
                              />
                              <Card.Content>
                                  <Card.Header>{candidate.name}</Card.Header>
                                  <Card.Meta>
                                      <strong>{candidate.approved ? "Candidate" : "Voter"}</strong>
                                  </Card.Meta>
                                  <Card.Description>
                                      <strong>Username: <b> {candidate.name} </b> </strong>
                                      <br/><br/>
                                      <Button id={candidate.id} color="blue" size='large' onClick={(e) => this.approve(e)}>Approve</Button>
                                  </Card.Description>
                              </Card.Content>
                          </Card>
                      </Grid.Column>
                    )
                    })

                  }

                  </Grid.Row>
                  </Grid>
                  </>
                )
             }


            </div>
        );
    }
}

export default Admin;
