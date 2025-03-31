import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CardListView from './views/CardListView';
import DeckBuilderView from './views/DeckBuilderView';
import MetaView from './views/MetaView';
import ScoringReportView from './views/ScoringReportView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CardListView />} />
        <Route path="/deckbuilder" element={<DeckBuilderView />} />
        <Route path="/meta" element={<MetaView />} />
        <Route path="/report" element={<ScoringReportView />} />
      </Routes>
    </Router>
  );
}

export default App;
