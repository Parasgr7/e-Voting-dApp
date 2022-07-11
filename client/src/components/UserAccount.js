import React, { Component } from 'react';
import { Card, Grid, Message, Button, Icon, Input } from 'semantic-ui-react';
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
      voter_exist_id: 0,
      img_text: 'Upload IdProof',
      img_button_disable: false
    }
  }
    componentDidMount = async () => {
      this.fetch_userAccount();

      this.fetch_userAccount = this.fetch_userAccount.bind(this);
      this.retrieveFile = this.retrieveFile.bind(this);
      this.registerCandidate = this.registerCandidate.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    fetch_userAccount = async() => {
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
        if(!candidate.approved && candidate.name.length !== 0)
        {
          this.setState({
            disable: true,
            buttonText: 'Candidate Approval Pending...'});
        }

      }
    }

    registerCandidate = async () => {
      var username_pretty = this.props.username.split('@')[0].charAt(0).toUpperCase() + this.props.username.split('@')[0].toLowerCase().slice(1)
      this.setState({isloading: true});
      await this.props.contract.methods.registerCandidate(username_pretty, this.state.url).send({ from: this.props.account, gas: '4700000' }).then((res) => {
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
      this.setState({filename: data.name});
      const reader = new window.FileReader();
      reader.readAsArrayBuffer(data);
      reader.onloadend = () => {
        this.setState({file: reader.result});
      }

      e.preventDefault();
    }

    handleSubmit = async (e) => {
      this.setState({img_text: "Uploading...", img_button_disable: true});
      e.preventDefault();
      try {
        const created = await client.add(this.state.file);
        const url = `https://ipfs.infura.io/ipfs/${created.path}`;
        this.setState({url: url});
        console.log(this.state);
        this.setState({img_text: "Change Image", img_button_disable: false});
      } catch (error) {
        console.log(error);
        toast.error('File not Found!!!', {hideProgressBar: true,theme: "white"});
        this.setState({img_text: "Upload Id Proof", img_button_disable: false});
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
                        <Grid.Column className="pads">
                            <Card fluid className="userAccount">
                              <div className="display" style={{"margin": 10}}>
                                { this.state.url.length !== 0
                                  ? (<><center><img src={this.state.url} height={250} width={480} alt="nfts"/></center></>)
                                  : (<><center><img src="https://ipfs.infura.io/ipfs/QmRLQCfLJ8VVMNjyUyNjTP8DXYuuAjkWuUG1S1KG4XSm72" height={200} width={200} alt="nfts"/></center></>)
                                }
                              </div>
                              {this.state.voter_exist_id ?
                                null
                                : (<>
                                  <Grid divided='vertically'>
                                    <Grid.Row centered columns={2}>
                                      <Grid.Column width={10}>
                                        <Input onChange={this.retrieveFile} required type="file" className="fileInput"/>
                                      </Grid.Column>
                                      <Grid.Column width={6} className="textCenter" style={{"marginTop": 10}}>
                                        <Button color='olive' disabled={this.state.img_button_disable} onClick={this.handleSubmit} className="imageUpload">{this.state.img_text}</Button>
                                      </Grid.Column>
                                    </Grid.Row>
                                  </Grid>
                                </>)}



                                <Card.Content>
                                    <Card.Header>{this.props.username}</Card.Header>
                                    <Card.Meta>
                                        <strong>{this.state.approved ? "Candidate" : "Voter"}</strong>
                                    </Card.Meta>
                                    <Card.Description>
                                        <span className="name">Username: <b className="name">
                                           {this.props.username.split('@')[0].charAt(0).toUpperCase() + this.props.username.split('@')[0].toLowerCase().slice(1)} </b>
                                        </span>
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
