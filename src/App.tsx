import React from 'react';
import ECGGraph from './components/ECGGraph';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1 style={{textAlign : "center"}} >ECG GRAPH VISUALIZER</h1>
      <ECGGraph  />
    </div>
  );
};

export default App;
