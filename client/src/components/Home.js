import React, { Component } from 'react';
import { Grid, List, Divider, Image, Segment } from 'semantic-ui-react';
import '../App.css';
import img from '../img/pdf/diagram.png';


class Home extends Component {
    render() {
        return (
            <div className='home-page'>
              <Grid.Row>
                <div className="homeHeader">Decentralized e-Voting App [dApp]</div>
              </Grid.Row>
              <Grid.Row>
                  <Grid.Column>
                      This is a demonstration of a Blockchain based authentication and decentralized e-Voting process.
                      In this project login information are not stored in a database, but the
                      hash resulting from login data is stored on a smart contract[Authentication].
                      <br/>
                      Another solidity contract[Election] is used for storing the electors as candidates and
                      the voting process is taken care by Admin.
                      At the end of the voting period the results are declared and winning candidate then claims &nbsp;
                      <strong>1 Ether</strong> as prize money[unlocked from the Smart Contract].
                  </Grid.Column>
              </Grid.Row>
              <Divider/>
              <Grid divided='vertically'>
                <Grid.Row columns={2}>
                  <Grid.Column width={8}>
                    <Grid.Row>
                      <span className="heading">Authentication Module</span>
                    </Grid.Row>
                    <br/>
                    <Grid.Row centered>
                      <Image src={img}/>
                    </Grid.Row>
                  </Grid.Column>
                  <Grid.Column width={8}>
                    <Grid.Row>
                      <span className="heading">Voting Module</span>
                    </Grid.Row>
                    <br/>
                    <Grid divided='vertically'>
                      <Grid.Row columns={2}>
                          <Grid.Column>
                            <Grid.Row>
                              <span className="subHeading">Admin[Contract Owner]</span>
                            </Grid.Row>
                            <br/>
                            <Grid.Row>
                              <List bulleted>
                                <List.Item>Approval of Candidates</List.Item>
                                <List.Item>Start Voting Period</List.Item>
                                <List.Item>End Election [again election can be organised]</List.Item>
                              </List>
                            </Grid.Row>
                          </Grid.Column>
                          <Grid.Column>
                            <Grid.Row>
                              <span className="subHeading">Candidate</span>
                            </Grid.Row>
                            <br/>
                            <Grid.Row>
                              <List bulleted>
                                <List.Item>SignIn/SignUp  as Elector</List.Item>
                                <List.Item>Register as Candidate</List.Item>
                                <List.Item>Participate in e-Voting</List.Item>
                                <List.Item>Check Results</List.Item>
                                <List.Item>Winner claims Prize[i.e 1 Ether]</List.Item>
                              </List>
                            </Grid.Row>
                          </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
        );
    }
}

export default Home;
