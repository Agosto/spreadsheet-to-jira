import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import 'react-bootstrap';

class InputSelections extends Component {
  render() {
    return (
      <div>
        <h5>
          Instance: {this.props.selectedInstance}
        </h5>

        <div>
          <TextField
            hintText="Email/Username"
            floatingLabelText="Email"
            type="text"
            name="email"
            onChange={this.props.onChange}
          />
        </div>
        <div>
          <TextField
            hintText="Password"
            floatingLabelText="Password"
            type="password"
            name="password"
            onChange={this.props.onChange}
            onBlur={this.props.isDisabled}
          />
        </div>
      </div>
    );
  }
}

export default InputSelections;
