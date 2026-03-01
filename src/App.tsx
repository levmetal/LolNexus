import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChampionsView from './pages/ChampionsView';
import ItemsView from './pages/ItemsView';
import DDragon from './services/ddragon';

function App() {
    const [currentView, setCurrentView] = useState<'champions' | 'items'>('champions');
    const [selectedChamp, setSelectedChamp] = useState<any>(null);
    const [championsData, setChampionsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const champs = await DDragon.getChampions();
                setChampionsData(champs);
            } catch (e) {
                console.error("Failed to load data", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="app-container">
            <Navbar
                currentView={currentView}
                setCurrentView={setCurrentView}
                onClearChamp={() => setSelectedChamp(null)}
            />

            <main className="main-content">
                {loading ? (
                    <div className="loader-container">
                        <div className="spinner"></div>
                        <p className="loading-text">Loading Data Dragon...</p>
                    </div>
                ) : (
                    <>
                        {currentView === 'champions' && (
                            <ChampionsView
                                championsData={championsData}
                                selectedChamp={selectedChamp}
                                setSelectedChamp={setSelectedChamp}
                            />
                        )}
                        {currentView === 'items' && <ItemsView />}
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
