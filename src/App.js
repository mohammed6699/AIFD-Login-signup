import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import PollList from './components/PollList';
import PollCreate from './components/PollCreate';
import PollView from './components/PollView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PollList />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/polls/create" element={<PollCreate />} />
        <Route path="/polls/:pollId" element={<PollView />} />
      </Routes>
    </Router>
  );
}

export default App;

