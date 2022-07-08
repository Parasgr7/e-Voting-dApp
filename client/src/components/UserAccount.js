import React, { Component } from 'react';
import { Card, Grid, Message, Button, Icon, Image, Input } from 'semantic-ui-react';
import LoadingAnimation from 'react-circle-loading-animation';
import '../App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {create} from 'ipfs-http-client';

const client = create({ host: "ipfs.infura.io", port: 5001, protocol: "https"});

class UserAccount extends Component {
  constructor() {
    super();
    this.state = {
      disable: false,
      buttonText: 'Register as Candidate',
      candidate_id: null ,
      approved: false,
      isloading:false,
      file: null,
      url: "",
      filename: null,
      voter_exist_id: 0
    }
  }
    componentDidMount = async () => {
      this.fetch_userAccount();
    }

    fetch_userAccount = async() => {
      var candidates_count = await this.props.contract.methods.candidatesCount().call({ from: this.props.account });
      var voter_exist_id = Number(await this.props.contract.methods.addressmap(this.props.account).call({ from: this.props.account }));
      this.setState({voter_exist_id: voter_exist_id});
      if (voter_exist_id !== 0)
      {
        var candidate = await this.props.contract.methods.candidates(this.state.voter_exist_id).call({ from: this.props.account });
        this.setState({
          candidate_id: candidate.id,
          approved: candidate.approved,
          url: candidate.image_addr
        });
        window.localStorage.setItem('userId', candidate.id );
        if(!candidate.approved)
        {
          this.setState({
            disable: true,
            buttonText: 'Candidate Approval Pending...'});
        }

      }
    }

    registerCandidate = async () => {
      this.setState({isloading: true});
      await this.props.contract.methods.registerCandidate(this.props.username, this.state.url).send({ from: this.props.account, gas: '4700000' }).then((res) => {
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
      var voter_exist_id = Number(await this.props.contract.methods.addressmap(this.props.account).call({ from: this.props.account }));
      this.setState({voter_exist_id: voter_exist_id });
    }

     retrieveFile = (e) => {
      const data = e.target.files[0];
      console.log(data);
      this.setState({filename: data.name});
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(data);
      reader.onloadend = () => {
        this.setState({file: reader.result});
      }

      e.preventDefault();
    }

    handleSubmit = async (e) => {
      e.preventDefault();
      console.log("Here");
      try {
        const created = await client.add(this.state.file);
        const url = `https://ipfs.infura.io/ipfs/${created.path}`;
        this.setState({url: url});
        console.log(this.state);
      } catch (error) {
        console.log(error);
      }
    };


    render() {
        return (
            <div className='user-account'>
              <ToastContainer toastStyle={{ backgroundColor: "#327F94" }}/>
              <LoadingAnimation isLoading={this.state.isloading} />
                <Grid centered stackable>
                  <h1 className="header">User Profile</h1>
                    <Grid.Row>
                        <Grid.Column>
                            <Card fluid className="userAccount">
                              <div className="display">
                                { this.state.url.length !== 0
                                  ? (<><center><img src={this.state.url} height={250} alt="nfts"/></center></>)
                                  : null
                                }
                              </div>
                              {this.state.voter_exist_id ?
                                null
                                : (<>
                                  <br/>
                                  <Grid divided='vertically'>
                                    <Grid.Row centered columns={2}>
                                      <Grid.Column width={10}>
                                        <Input onChange={this.retrieveFile} type="file" className="fileInput"/>
                                      </Grid.Column>
                                      <Grid.Column width={6} className="uploadCont">
                                        <Button primary onClick={this.handleSubmit} className="imageUpload">Upload Image</Button>
                                      </Grid.Column>
                                    </Grid.Row>
                                  </Grid>
                                </>)}



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
                                          (<>
                                            <Button color="green" size='large'> <Icon name="check"/>Approved</Button>
                                        </>)
                                         :
                                         <Button primary disabled={this.state.disable} size='large' onClick={this.registerCandidate}>{this.state.buttonText}</Button>
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
