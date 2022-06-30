import React, { Component } from 'react';

class SignOut extends Component {
    componentDidMount = () => {
        this.props.loggedOut(false);
    }

    render() {
        return (
            <div>
              You have been logged out
            </div>
        );
    }
}

export default SignOut;
