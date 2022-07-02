import React, { Component } from 'react';
import { Card, Grid, Message, Image, Button } from 'semantic-ui-react';
import '../App.css';
import CountdownTimer from './CountdownTimer';


class Voting extends Component {
  constructor() {
    super();
    this.state = {
      disable: false,
      buttonText: 'Vote',
      candidate_id: null ,
      approved: false,
      approved_candidates: [],
      color: "green",
      voted: false,
      votingProcess: false
    }
  }
    componentDidMount = async () => {
      this.fetch_candidates_data();
      this.hasVoted();
      console.log(this.state);
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
          if(candidate.approved)
          {
            arr.push(candidate);
          }
        }
        this.setState({approved_candidates: arr});
    }

    hasVoted = async() =>{
      var voted = await this.props.contract.methods.voters(this.props.account).call({ from: this.props.account });
      this.setState({voted: voted});
    }

    vote = async (candidate_id) => {
       // await this.props.contract.methods.vote(candidate_id).send({ from: this.props.account, gasLimit: 50000 });
        console.log(this.state);
    }
    render() {
        return (

            <div className='user-account'>
            {this.state.approved_candidates.length === 0 ? <h1>No Candidates</h1> :
              <>
              <Grid columns={this.state.approved_candidates.length} divided>
              <h1>Cast your vote</h1>
                <CountdownTimer targetDate={this.state.endTime} votingProcess={this.state.votingProcess} />
                  <Grid.Row>
                  {
                    this.state.approved_candidates.map((candidate, index) => {
                      return(
                      <Grid.Column key = {candidate.id} >
                          <Card fluid>
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
                                      <Button basic disabled={this.state.disable} color= {this.state.color} size='large' onClick={()=> this.vote(candidate.id)}>{this.state.buttonText}</Button>
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
             }


            </div>
        );
    }
}

export default Voting;
