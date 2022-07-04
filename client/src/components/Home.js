import React, { Component } from 'react';
import { Grid, Image } from 'semantic-ui-react';
import img from '../img/background7.jpeg';
import '../App.css';
import { Container, Row, Col, Card } from 'bootstrap-4-react';


class Home extends Component {
    render() {
        return (

      //     <Container>
      //   <Row>
      //     <Col col="sm">
      //       <Card style={{ width: '18rem' }}>
      //           <Card.Header>Feature</Card.Header>
      //           <Card.Body>
      //             <Card.Title>Card title</Card.Title>
      //             <Card.Subtitle mb="2" text="muted">Card subtitle</Card.Subtitle>
      //             <Card.Text>Some quick example text to build on the card title and make up the bulk of the card's content.</Card.Text>
      //           </Card.Body>
      //           <Card.Footer>
      //             <Card.Link href="#">Another Link</Card.Link>
      //           </Card.Footer>
      //         </Card>
      //
      //     </Col>
      //
      //     <Col col="sm">One of three columns</Col>
      //     <Col col="sm">One of three columns</Col>
      //   </Row>
      // </Container>
            <div className='home-page'>
                <Grid stackable columns={3} textAlign='left'>
                    <Grid.Row>
                        <Grid.Column width={8}>
                            This is a demonstration of a Blockchain based authentication
                            where login information are not stored in a database, but the
                            hash resulting from login data is stored on a smart contract.
                            To authenticate users need an athereum address, a username, a
                            password and a four digit code. The user must be connected to
                            the Blockchain before authentication since the web3 sign method
                            is used to generate a cryptographic signature necessary for
                            the generation of the user's login data hash.
                        </Grid.Column>
                        <Grid.Column width={1}>

                        </Grid.Column>
                        <Grid.Column width={7}>
                            <Image src={img} alt='image' />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </div>
        );
    }
}

export default Home;
