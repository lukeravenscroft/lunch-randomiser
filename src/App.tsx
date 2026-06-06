import { useState } from 'react';
import { AddSpotForm } from './components/AddSpotForm';
import { Randomiser } from './components/Randomiser';
import { useSpots } from './hooks/useSpots';
import './App.css';

type View = 'randomiser' | 'add';

function App() {
  const [view, setView] = useState<View>('randomiser');
  const { spots, loading, error, addSpotLocally } = useSpots();

  return (
    <div className="app">
      <header className="app-header">
        <div className="hero-banner">
          <img
            className="hero-image"
            src="/lunch-hero-collage.png"
            alt="Collage of delicious lunch food"
          />
        </div>
        <div className="app-header-text">
          <p className="eyebrow">Lunch decision helper</p>
          <h1>Lunch Randomiser</h1>
          <p className="lede">Stop defaulting to the same place. Let chance pick lunch.</p>
        </div>
      </header>

      <nav className="view-nav">
        <button
          type="button"
          className={`nav-button ${view === 'randomiser' ? 'active' : ''}`}
          onClick={() => setView('randomiser')}
        >
          Randomiser
        </button>
        <button
          type="button"
          className={`nav-button ${view === 'add' ? 'active' : ''}`}
          onClick={() => setView('add')}
        >
          Add a new spot
        </button>
      </nav>

      <main className="app-main">
        {loading && <p className="status-message">Loading lunch spots…</p>}
        {error && <p className="status-message error">{error}</p>}

        {!loading && !error && view === 'randomiser' && <Randomiser spots={spots} />}

        {!loading && view === 'add' && (
          <AddSpotForm
            onSpotAdded={(spot) => {
              addSpotLocally(spot);
              setView('randomiser');
            }}
            onCancel={() => setView('randomiser')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
