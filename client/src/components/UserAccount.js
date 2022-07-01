import React, { Component, useState } from 'react';
import { Card, Grid, Message, Image, Button } from 'semantic-ui-react';
import '../App.css';

class UserAccount extends Component {
  constructor() {
    super();
    this.state = {
      disable: false,
      buttonText: 'Register as Candidate'
    }
  }
    componentDidMount = async () => {
      let username = this.props.username.split('@')[0].charAt(0).toUpperCase() +  this.props.username.split('@')[0].toLowerCase().slice(1);
      let candidates_count = await this.props.contract.methods.candidatesCount().call({ from: this.props.account });
      for(var i=1; i<= candidates_count; i++ )
      {
        var candidates = await this.props.contract.methods.candidates(i).call({ from: this.props.account });
        if(username  == candidates.name)
        {
          this.setState({disable: true, buttonText: 'Approval Pending...'});
        }
      }

    }

    registerCandidate = async () => {
      let username = this.props.username.split('@')[0].charAt(0).toUpperCase() +  this.props.username.split('@')[0].toLowerCase().slice(1);
      await this.props.contract.methods.registerCandidate(username).send({ from: this.props.account });
      this.setState({disable: true, buttonText: "Approval Pending..." });
    }
    render() {
        return (
            <div className='user-account'>
                <Grid centered stackable>
                    <Grid.Row>
                        <Grid.Column>
                            <Card fluid>
                                <Image
                                    src='https://react.semantic-ui.com/images/avatar/large/steve.jpg'
                                    wrapped ui={false}
                                />
                                <Card.Content>
                                    <Card.Header>{this.props.username}</Card.Header>
                                    <Card.Meta>
                                        <span>user</span>
                                    </Card.Meta>
                                    <Card.Description>
                                        <strong>
                                            {
                                                this.props.username.charAt(0).toUpperCase() +
                                                this.props.username.toLowerCase().slice(1)
                                            }
                                            <br/>
                                            <br/>
                                            <Button primary fluid disabled={this.state.disable} size='large' onClick={this.registerCandidate}>{this.state.buttonText}</Button>
                                        </strong>
                                    </Card.Description>
                                </Card.Content>
                                <Card.Content extra>
                                    <Message size='mini'>
                                        {this.props.account.toLowerCase()}
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
