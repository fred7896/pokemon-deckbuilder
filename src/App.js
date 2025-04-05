import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import './App.css';
// Importing views
import DeckBuilderView from './views/DeckBuilderView';
import CardListView from './views/CardListView';
import DebugView from './views/DebugView';
import MetaView from './views/MetaView';
import ScoringReportView from './views/ScoringReportView';
import WeightsEditorView from './views/WeightsEditorView';
import SimulatorView from './views/SimulatorView';
import DeckBuilderHub from './views/DeckBuilderHub';
import AutoDeckBuilderView from './views/AutoDeckBuilderView';
import ManualDeckBuilderView from './views/ManualDeckBuilderView';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/deck-builder" element={<DeckBuilderHub />} />
          <Route path="/deck-builder/manual" element={<ManualDeckBuilderView />} />
          <Route path="/deck-builder/auto" element={<AutoDeckBuilderView />} />
          <Route path="/deck-builder/scoring" element={<DeckBuilderView />} />
          <Route path="/card-list" element={<CardListView />} />
          <Route path="/debug" element={<DebugView />} />
          <Route path="/meta" element={<MetaView />} />
          <Route path="/scoring" element={<ScoringReportView />} />
          <Route path="/weights" element={<WeightsEditorView />} />
          <Route path="*" element={<DeckBuilderView />} />
          <Route path="/simulator" element={<SimulatorView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
