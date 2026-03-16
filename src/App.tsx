import { useState, useEffect } from 'react';
import Navbar from './shared/components/Navbar';
import ChampionsView from './features/champions/ChampionsView';
import ItemsView from './features/items/ItemsView';
import RunesView from './features/runes/RunesView';
import StatSummaryBar from './shared/components/StatSummaryBar';
import MerakiAPI from './features/champions/services/meraki';
import { useBuildStore } from './features/build/useBuildStore';

function App() {
    const [currentView, setCurrentView] = useState<'champions' | 'items' | 'runes'>('champions');
    const [selectedChamp, setSelectedChamp] = useState<any>(null);
    const [championsData, setChampionsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const resetBuild = useBuildStore(state => state.resetBuild);

    // Reset build when changing champion
    useEffect(() => {
        resetBuild();
    }, [selectedChamp, resetBuild]);

    useEffect(() => {
        async function loadData() {
            try {
                const champs = await MerakiAPI.getChampions();
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
                        <p className="loading-text">Loading Champion Data...</p>
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
                        {currentView === 'runes' && <RunesView />}
                    </>
                )}
            </main>

            <StatSummaryBar
                selectedChamp={selectedChamp}
            />
        </div>
    );
}

export default App;
