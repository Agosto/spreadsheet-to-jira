import React, { Component } from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
import TextField from 'material-ui/TextField';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import { parseEntries } from './utils';
import Header from './components/Header';
import Inputs from './components/Inputs';
import HelpText from './components/HelpText';
import { postTimeEntry as postTimeEntryApi } from './api';
import './App.css';
import 'react-bootstrap';
import LoggedEntries from './components/LoggedEntries';
import config from './config';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

class App extends Component {
  state = {
    disabled: true,
    loggedEntries: [],
    selectedInstance: config.INSTANCE_NAME,
    email: null,
    password: null,
    entries: '',
    parsedEntries: null,
  };

  parseAndSetState = entries => {
    let { failure, failureMessage, parsedEntries } = parseEntries(entries);
    let newState = this.state;
    if (!failure) {
      newState.parsedEntries = parsedEntries.data;
    } else {
      if (failureMessage) {
        alert(failureMessage);
      }
      newState.entries = '';
      newState.success = false;
      newState.disabled = true;
    }
    this.setState(newState, () => {
      this.isDisabled();
    });
  };

  _jobCompletedFully() {
    console.log(`JOB COMPLETED FULLY AT ${new Date().toLocaleString()}`);
    this.setState({
      success: true,
      disabled: false,
      error: false,
      loading: false,
      loggedEntries: [],
      successMsg: 'Your logs have been posted successfully',
    });
  }

  postSuccess = (response, entry, index) => {
    console.log(
      `SUCCESS: LINE: ${entry} with JIRA WORKLOG ID: ${response.data.worklog_id} AT ${new Date().toLocaleString()}`
    );

    let nextState = this.state;
    nextState.loggedEntries.push(entry.join(', '));
    this.setState(nextState);
    this.postTimeEntry(null, index + 1);
  };

  _handlePostError502 = (error, entry, message, index) => {
    let errorMsg;

    if (error.response.status === 502) {
      if (message) {
        errorMsg = `502 Bad Gateway. ${message} Automatically Retrying from last succesful entry.`;
      } else {
        errorMsg = '502 Bad Gateway. Automatically Retrying from last succesful entry.';
      }

      let nextState = this.state;

      nextState.error = false;
      nextState.loading = false;
      nextState.disabled = false;
      nextState.success = false;
      nextState.errorMsg = errorMsg;

      this.setState(nextState, () => {
        console.log(`Continuing with ${entry}`);
        this.postTimeEntry(null, index);
      });
    }
  };

  postError = (error, entry, index) => {
    console.log(`FAILURE AT ${new Date().toLocaleString()} AT LINE: ${entry}`);
    let message = null;

    if (this.state.loggedEntries.length > 0) {
      message = 'Your last successful entry was ' + this.state.loggedEntries.slice(-1).pop();
    }

    let errorMsg = null;
    if (error.response.data.message) {
      if (message) {
        errorMsg = error.response.data.message + ' ' + message;
      } else {
        errorMsg = error.response.data.message;
      }

      let nextState = this.state;
      nextState.error = true;
      nextState.loading = false;
      nextState.disabled = true;
      nextState.loggedEntries = [];
      nextState.success = false;
      nextState.errorMsg = errorMsg;
      this.setState(nextState);
    } else {
      this._handlePostError502(error, entry, message, index);
    }
  };

  postTimeEntry = (initialRequest, postAtIndex = 0) => {
    if (initialRequest) {
      console.log(`Submitted at: ${new Date().toLocaleString()}`);
    }

    let parsedEntries = this.state.parsedEntries;

    let nextState = this.state;
    nextState.disabled = true;
    nextState.error = false;
    nextState.success = false;
    nextState.loading = true;
    this.setState(nextState);

    let entry = parsedEntries[postAtIndex];

    if (entry) {
      postTimeEntryApi(this.state.email, this.state.password, this.state.selectedInstance, entry)
        .then(data => this.postSuccess(data, entry, postAtIndex))
        .catch(err => this.postError(err, entry, postAtIndex));
    } else {
      this._jobCompletedFully();
    }
  };

  onChange = e => {
    let nextState = this.state;
    const name = e.target.name;
    const value = e.target.value || '';
    nextState[name] = value;
    this.setState(nextState, () => {
      if (name === 'entries') {
        this.parseAndSetState(this.state.entries);
      }
      this.isDisabled();
    });
  };

  emailIsValid = () => {
    return !(this.state.email === '' || !this.state.email);
  };

  passwordIsValid = () => {
    return !(this.state.password === '' || !this.state.password);
  };

  isDisabled = () => {
    let disabled = true;
    if (this.emailIsValid() && this.passwordIsValid() && this.state.entries) {
      disabled = false;
    }
    this.setState({
      success: null,
      disabled: disabled,
    });
  };

  clearTimeEntry = () => {
    let newState = this.state;
    newState.entries = '';
    this.setState(newState);
  };

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <Header />
          <div className="col-md-12">
            <Inputs
              selectedInstance={this.state.selectedInstance}
              instanceTypes={this.state.instanceTypes}
              onChange={this.onChange}
              isDisabled={this.isDisabled}
            />
          </div>

          <div style={{ marginTop: '40px' }}>
            <HelpText />
          </div>

          <br />
          <RaisedButton label="CLEAR" onClick={this.clearTimeEntry} />
          <br />

          <TextField
            placeholder="Paste your Time Entry here"
            multiLine={true}
            rows={3}
            name="entries"
            onChange={this.onChange}
            value={this.state.entries}
            style={{ width: '1000px', fontSize: '0.8em', marginTop: '100px' }}
          />

          <div style={{ marginBottom: '100px', marginTop: '25px' }}>
            <RaisedButton
              label="Submit"
              onClick={e => this.postTimeEntry(true)}
              disabled={this.state.disabled}
              style={{ marginTop: '10px' }}
            />

            <LoggedEntries loggedEntries={this.state.loggedEntries} />

            {this.state.loading ? <h2 style={{ color: 'blue' }}>Loading...</h2> : ''}

            {this.state.success
              ? <h2 style={{ color: 'green' }}>
                  {this.state.successMsg}
                </h2>
              : ''}

            {this.state.error
              ? <h2 style={{ color: 'red' }}>
                  Error: {this.state.errorMsg}
                </h2>
              : ''}
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
