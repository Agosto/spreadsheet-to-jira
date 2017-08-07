import React, { Component } from 'react';

class LoggedEntries extends Component {
  render() {
    return (
      <div>
        {this.props.loggedEntries
          ? this.props.loggedEntries.map(function(object, i) {
              return (
                <p style={{ color: 'purple' }} key={i}>
                  Last Logged: {object}
                </p>
              );
            })
          : ''}
      </div>
    );
  }
}

export default LoggedEntries;
