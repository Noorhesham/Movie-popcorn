import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Starrating from './Starrating';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> 
    {/* <Starrating MaxRating={4} messages={['terrible','okay','good','amazing']}/> */}
  </React.StrictMode>
);

