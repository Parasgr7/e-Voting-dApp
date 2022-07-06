import React, { Component } from 'react';

class SignOut extends Component {
    componentDidMount = () => {
        this.props.loggedOut(false);
    }

    render() {
        return (
            <h1 className="header">
              You have been logged out
            </h1>
        );
    }
}

export default SignOut;
