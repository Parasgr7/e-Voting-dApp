import React, { Component } from 'react';
import { Card, Grid, Message, Image, Button } from 'semantic-ui-react';
import '../App.css';

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disable: false,
      buttonText: 'Approve',
      candidate_id: null ,
      candidates_count: 0,
      approved: false,
      unapproved_candidates: [],
      color: 'blue'
    }

  }
    componentDidMount = async () => {
      this.fetch_candidates();

    }

    fetch_candidates = async() => {
      var candidates_count = await this.props.contract.methods.candidatesCount().call({ from: this.props.account });
      this.setState({candidates_count: Number(candidates_count)});
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

    approve= async (candidate_id) => {
      await this.props.contract.methods.approve(candidate_id).send({ from: this.props.account });
      this.setState({disable: true, buttonText: "Approved", color: "green" });
    }

    render() {
        return (
            <div className='user-account'>
            {this.state.unapproved_candidates.length == 0 ? null :
              <>
              <Grid columns={this.state.unapproved_candidates.length} divided>
                  <Grid.Row>
                  {
                    this.state.unapproved_candidates.map((candidate, index) => {
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
                                      <Button disabled={this.state.disable} color= {this.state.color} size='large' onClick={()=> this.approve(candidate.id)}>{this.state.buttonText}</Button>
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

export default Admin;
