import React, { Component } from 'react';
import { Card, Grid, Button, Message, Icon } from 'semantic-ui-react';
import '../App.css';
import CountdownTimer from './CountdownTimer';
import LoadingAnimation from 'react-circle-loading-animation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


class Voting extends Component {
  constructor() {
    super();
    this._isMounted = false;

    this.state = {
      disable: 0,
      buttonText: 'Vote',
      approved: false,
      approved_candidates: [],
      color: "green",
      voted: false,
      votingProcess: false,
      votingResult: [1],
      voted_id:1,
      buttonText: "Vote",
      display_results: false,
      results_button_text: 'Show Results',
      claim_gift_text: 'Claim Gift',
      claim_gift_button: "blue",
      claim_gift_disabled: false,
      votingPeriod: false,
      gift_claimed: false,
      isloading:false,
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
        var gift_claimed = await this.props.contract.methods.gift_claimed().call({ from: this.props.account });

        this.setState({
          candidates_count: Number(candidates_count),
          startTime: Number(startTime),
          endTime: Number(endTime),
          votingProcess: votingProcess,
          gift_claimed : gift_claimed
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
        console.log(this.state);
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

    hasVoted = async(id) =>{
      var voted = await this.props.contract.methods.voters(this.props.account).call({ from: this.props.account });
      this.setState({voted: voted, voted_id: id});
    }

    cast_vote = async (event) => {
       this.setState({isloading: true});
       event.persist();
       await this.props.contract.methods.vote(event.target.id).send({ from: this.props.account}).then(()=>{
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
       this.hasVoted(event.target.id);
    }

    claim_gift = async (candidate_id) =>{
      this.setState({isloading: true});
      await this.props.contract.methods.claim_gift(candidate_id).send({ from: this.props.account, gas: '4700000' }).then(()=>{
        this.setState({isloading: false,claim_gift_text: "1 Ether Received", claim_gift_disabled: true, gift_claimed: true});
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
              <ToastContainer toastStyle={{ backgroundColor: "#327F94" }}/>
              <LoadingAnimation isLoading={this.state.isloading} />
              <Grid stackable>
                  {this.state.approved_candidates.length === 0 ? <h1 className="header">Awaiting Election</h1> :
                  <Grid.Row>
                  <>
                    <Grid columns={this.state.approved_candidates.length <= 3 ? this.state.approved_candidates.length : 4} divided>
                        <Grid.Row centered>
                          <Grid.Column className="textCenter">
                            {this.state.voted? <h1 className="header">Vote Recorded</h1>
                              :(this.state.endTime < this.state.dateNow && this.state.endTime !== 0 ?  <h1 className="header">Election Results</h1>
                              : this.state.endTime < this.state.dateNow && this.state.endTime == 0 ? <h1 className="header">Awaiting Election</h1>
                              : <h1 className="header">Cast your vote</h1> )
                            }
                          </Grid.Column>
                        </Grid.Row>
                        <Grid.Row centered>
                          <Grid.Column>
                            <CountdownTimer targetDate={this.state.endTime} votingProcess={this.state.votingProcess} />
                          </Grid.Column>
                        </Grid.Row>
                        <Grid.Row centered>
                          <Grid.Column className="textCenter">
                            {(this.state.votingProcess && this.state.endTime < this.state.dateNow) ? <Button color= "green" size="large" onClick={()=> this.fetch_election_results()}>{this.state.results_button_text}</Button>: null}
                          </Grid.Column>
                        </Grid.Row>
                        <Grid.Row>
                          {
                            this.state.approved_candidates.map((candidate, index) => {
                              return(
                                  <Grid.Column key={index} className="pads" >
                                    {
                                      this.state.votingResult.length === 1 ?
                                      (
                                        <>
                                          <Card fluid className={(this.state.votingResult[0] == candidate.id && this.state.display_results) ? 'electionWinner' : (this.state.approved_candidates.length <= 2 ? "userAccount" : "adminCards")}>
                                              <div className="display" style={{"margin": 10}}>
                                                { candidate.image_addr.length !== 0
                                                  ? (<><center><img src={candidate.image_addr} height={250} width={this.state.approved_candidates.length<=2 ? 480 : 280} alt="nfts"/></center></>)
                                                  : (<><center><img src="https://ipfs.infura.io/ipfs/QmRLQCfLJ8VVMNjyUyNjTP8DXYuuAjkWuUG1S1KG4XSm72" height={250} width={250} alt="nfts"/></center></>)
                                                }
                                              </div>
                                            <Card.Content>

                                                <Card.Header style={{'overflowWrap': 'break-word'}}>{candidate.name + "@gmail.com"}</Card.Header>

                                                <Card.Meta>
                                                    <strong>{candidate.approved ? "Candidate" : "Voter"}</strong>
                                                </Card.Meta>
                                                <Card.Description>
                                                  <span className="name">Username: <b className="name"> {candidate.name} </b> </span>
                                                    <br/>
                                                    <br/>

                                                    {
                                                      (this.state.votingProcess && !this.state.voted && (this.state.endTime > this.state.dateNow) ) ?
                                                      <Button id={candidate.id} color="green" size='large' onClick={(event)=> this.cast_vote(event)}>Vote</Button>
                                                      :
                                                        ((this.state.voted_id === candidate.id) && this.state.voted)  ? <Button id={candidate.id} disabled color="green" size='large' >Voted</Button>: null
                                                    }

                                                </Card.Description>
                                                {
                                                  ((this.state.votingResult[0] == candidate.id && this.state.display_results)?
                                                    (
                                                      <>
                                                      <Grid.Row>
                                                        <Grid.Column className="textCenter">
                                                          {this.state.gift_claimed ?
                                                            <Button disabled="true" className="claim_gift" size='large'><Icon name="check"/>1 Ether Received</Button>
                                                              :
                                                              (<>
                                                                {(this.state.userId === candidate.id) ?
                                                                  (<>
                                                                    <Button disabled={this.state.claim_gift_disabled} color="blue" className={this.state.claim_gift_disabled ? "claim_gift" : null} size='large' onClick={()=> this.claim_gift(candidate.id)}>{this.state.claim_gift_disabled ? <Icon name="check"/> : null}{this.state.claim_gift_text}</Button>
                                                                    </>)
                                                                  : null }
                                                              </>)
                                                            }

                                                        </Grid.Column>
                                                      </Grid.Row>
                                                      </>
                                                    )
                                                    :
                                                    null
                                                  )
                                                }
                                            </Card.Content>
                                            <Card.Content extra>
                                                <Message size='mini'>
                                                    {this.state.display_results? <><span className="voting">Vote Count: <b className="vote_count"> {candidate.voteCount} </b></span> <br/></> : null}
                                                    {candidate.candidate_address}
                                                </Message>
                                            </Card.Content>
                                          </Card>
                                        </>
                                      )
                                      :
                                      (
                                        <>
                                        <Card fluid className={((this.state.votingResult[0] == candidate.id || this.state.votingResult[1] == candidate.id) && this.state.display_results) ? 'electionWinner' : (this.state.approved_candidates.length <= 2 ? "userAccount" : null)}>
                                          <div className="display" style={{"margin": 10}}>
                                            { candidate.image_addr.length !== 0
                                              ? (<><center><img src={candidate.image_addr} height={250} width={this.state.approved_candidates.length<=2 ? 280 : 250} alt="nfts"/></center></>)
                                              : (<><center><img src="https://ipfs.infura.io/ipfs/QmRLQCfLJ8VVMNjyUyNjTP8DXYuuAjkWuUG1S1KG4XSm72" height={250} width={this.state.approved_candidates.length<=2 ? 480 : 250} alt="nfts"/></center></>)
                                            }
                                          </div>
                                          <Card.Content>
                                            {
                                              (((this.state.votingResult[0] == candidate.id || this.state.votingResult[1] == candidate.id) && this.state.display_results)?
                                              (
                                                <>
                                                  <Grid.Row>
                                                    <Grid.Column floated="right">
                                                      <span className="name"> <b className="tie"> TIE </b></span>
                                                    </Grid.Column>
                                                  </Grid.Row>
                                                </>
                                              )

                                              : null)
                                            }
                                              <Card.Header>{candidate.name}</Card.Header>
                                              <Card.Meta>
                                                  <strong>{candidate.approved ? "Candidate" : "Voter"}</strong>
                                              </Card.Meta>
                                              <Card.Description>
                                                <span className="name">Username: <b className="name"> {candidate.name} </b> </span>
                                              </Card.Description>
                                              </Card.Content>
                                              <Card.Content extra>
                                                  <Message size='mini'>
                                                      {this.state.display_results? <span className="voting">Vote Count: <b className="vote_count"> {candidate.voteCount} </b></span> : null}
                                                      {candidate.candidate_address}
                                                  </Message>
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
                </Grid.Row>
                }
            </Grid>
          </div>
        );
    }
}

export default Voting;
