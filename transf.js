// Import React and ReactDOM libraries
import React from 'react';
import ReactDOM from 'react-dom';
 
// Import Slider component from react-slider library
import Slider from 'react-slider';
 
// Define a custom component that renders a slider with some props
class MySlider extends React.Component {
  constructor(props) {
    super(props);
    // Set the initial state of the slider value
    this.state = {
      value: props.defaultValue || 0
    };
  }
 
  // Define a handler function that updates the state when the slider changes
  handleChange = (value) => {
    this.setState({ value });
  };
 
  // Define a render function that returns the JSX element for the slider
  render() {
    return (
      <div className="my-slider">
        <p>{this.props.label}: {this.state.value}</p>
        <Slider
          min={this.props.min || 0}
          max={this.props.max || 100}
          step={this.props.step || 1}
          value={this.state.value}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}
 
// Define the main App component that renders multiple sliders
class App extends React.Component {
  render() {
    return (
      <div className="app">
        <h1>React Slider Example</h1>
        <MySlider label="Volume" min={0} max={10} defaultValue={5} />
        <MySlider label="Brightness" min={0} max={100} defaultValue={50} step={5} />
        <MySlider label="Speed" min={-10} max={10} defaultValue={0} />
      </div>
    );
  }
}
 
// Render the App component to the root element in the HTML document
ReactDOM.render(<App />, document.getElementById('root'));
