import React, { Component } from 'react';
import { Card, Grid, Image, Button } from 'semantic-ui-react';
import '../App.css';
import CountdownTimer from './CountdownTimer';


class Voting extends Component {
  constructor() {
    super();
    this._isMounted = false;

    this.state = {
      disable: false,
      buttonText: 'Vote',
      approved: false,
      approved_candidates: [],
      color: "green",
      voted: false,
      votingProcess: false,
      votingResult: [1],
      display_results: false,
      results_button_text: 'Show Results',
      votingPeriod: false,
      userId: window.localStorage.getItem('userId') || '',
      dateNow: Math.floor((new Date().getTime())/1000)

    }
  }
    componentDidMount = async () => {
      this._isMounted = true;

      this.fetch_candidates_data();
      this.hasVoted();
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

    fetch_election_results = async() =>{
      if (!this.state.display_results)
      {
        var result = {};
        var voting_result=[];
        for(var i=1; i<= this.state.candidates_count; i++ )
        {
          var candidate = await this.props.contract.methods.candidates(i).call({ from: this.props.account });
          if(candidate.approved)
          {
            result[candidate.id] = Number(candidate.voteCount);
          }
        }
        var keys = Object.keys(result);
        voting_result = keys.sort(function(a, b) { return result[b] - result[a] }).map(Number);
        if (result[voting_result[0]] === result[voting_result[1]])
        {
          voting_result = voting_result.slice(0,2);
        }
        else
        {
          voting_result = voting_result.slice(0,1);
        }
        this.setState({votingResult: voting_result, display_results: !this.state.display_results});
        this.state.display_results ? this.setState({results_button_text: 'Hide Results'}): this.setState({results_button_text: 'Show Results'});
      }
      else
      {
        this.setState({display_results: !this.state.display_results});
        this.state.display_results ? this.setState({results_button_text: 'Show Results'}): this.setState({results_button_text: 'Hide Results'});
      }

    }

    hasVoted = async() =>{
      var voted = await this.props.contract.methods.voters(this.props.account).call({ from: this.props.account });
      this.setState({voted: voted});
    }

    cast_vote = async (candidate_id) => {
       await this.props.contract.methods.vote(candidate_id).send({ from: this.props.account, gasLimit: 50000 });
    }

    render() {
        return (

            <div className='user-account'>
            {this.state.approved_candidates.length === 0 ? <h1>No Candidates</h1> :
              <>
              <Grid columns={this.state.approved_candidates.length} divided>
              <h1>Cast your vote</h1>
                <CountdownTimer targetDate={this.state.endTime} votingProcess={this.state.votingProcess} />
                <br/>
                {(this.state.votingProcess && this.state.endTime < this.state.dateNow) ? <Button basic color= "green" size="large" onClick={()=> this.fetch_election_results()}>{this.state.results_button_text}</Button>: null}

                  <Grid.Row>
                  {
                    this.state.approved_candidates.map((candidate, index) => {
                      return(
                      <Grid.Column key = {candidate.id} >
                        {
                          this.state.votingResult.length === 1 ?
                          (
                            <>
                              <Card fluid className={(this.state.votingResult[0] == candidate.id && this.state.display_results) ? 'electionWinner' : null}>
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
                                        <br/>
                                        {this.state.display_results? <strong>Vote Count: <b> {candidate.voteCount} </b> </strong> : null}
                                          {
                                            ((this.state.votingResult[0] == candidate.id && this.state.display_results)?
                                              (
                                                <>
                                                <b> WINNER </b>
                                                <br/>
                                                {this.state.userId === candidate.id ? <Button basic color="teal" size='large' onClick={()=> this.claim_gift()}>Claim Gift</Button>: null }
                                                </>
                                              )
                                              :
                                              null
                                            )
                                          }
                                        <br/>
                                        <Button basic disabled={this.state.disable} color= {this.state.color} size='large' onClick={()=> this.cast_vote(candidate.id)}>{this.state.buttonText}</Button>
                                    </Card.Description>
                                </Card.Content>
                              </Card>
                            </>
                          )
                          :
                          (
                            <>
                            <Card fluid className={((this.state.votingResult[0] == candidate.id || this.state.votingResult[1] == candidate.id) && this.state.display_results) ? 'electionWinner' : null}>
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
                                      <br/>
                                      {this.state.display_results? <strong>Vote Count: <b> {candidate.voteCount} </b> </strong> : null}
                                      {
                                        (((this.state.votingResult[0] == candidate.id || this.state.votingResult[1] == candidate.id) && this.state.display_results)?
                                        (
                                          <>
                                          <b> Tie </b>
                                          <br/>
                                            {this.state.userId === candidate.id ? <Button basic color="teal" size='large' onClick={()=> this.claim_gift()}>Claim Gift</Button>: null }
                                          </>
                                        )

                                        : null)
                                      }

                                      <br/>
                                      <Button basic disabled={this.state.disable} color= {this.state.color} size='large' onClick={()=> this.cast_vote(candidate.id)}>{this.state.buttonText}</Button>
                                  </Card.Description>
                              </Card.Content>
                            </Card>
                            </>
                          )
                        }

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
