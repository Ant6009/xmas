import React, { useState, useEffect } from 'react';
import { Lock, Check, RefreshCw, LogOut } from 'lucide-react';
import './App.css';
import { loadItems, saveItems, subscribeToItems, initializeItems } from './firebaseService';

export default function PartySelectionApp() {
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [passcode, setPasscode] = useState('');
        const [currentUserName, setCurrentUserName] = useState('');
        const [tempName, setTempName] = useState('');
        const [showNamePrompt, setShowNamePrompt] = useState(false);
        const [selectedItem, setSelectedItem] = useState(null);
        const [error, setError] = useState('');
        const [loading, setLoading] = useState(true);
        const [showUnclaimConfirm, setShowUnclaimConfirm] = useState(false);
        const [actionLoading, setActionLoading] = useState(false);

        const CORRECT_PASSCODE = 'party2025';

        const DEFAULT_ITEMS = [
                { id: 1, name: 'White Rum', claimedBy: null },
                { id: 2, name: 'Tequila', claimedBy: null },
                { id: 3, name: 'Orange liqueur', claimedBy: null },
                { id: 4, name: 'Whiskey', claimedBy: null },
                { id: 5, name: 'Vodka', claimedBy: null },
                { id: 6, name: 'Cranberry Juice', claimedBy: null },
                { id: 7, name: 'Ginger beer', claimedBy: null },
        ];

        const [items, setItems] = useState(DEFAULT_ITEMS);

        useEffect(() => {
                loadData();

                // Subscribe to real-time updates
                const unsubscribe = subscribeToItems((updatedItems) => {
                        setItems(updatedItems);
                });

                // Cleanup subscription on unmount
                return () => unsubscribe();
        }, []);

        const loadData = async () => {
                try {
                        const items = await loadItems();
                        if (items) {
                                setItems(items);
                        } else {
                                // Initialize with default items if database is empty
                                await initializeItems(DEFAULT_ITEMS);
                                setItems(DEFAULT_ITEMS);
                        }
                } catch (err) {
                        console.error('Error loading data:', err);
                        setError('Failed to load data. Please refresh the page.');
                } finally {
                        setLoading(false);
                }
        };

        const saveData = async (newItems) => {
                try {
                        await saveItems(newItems);
                } catch (err) {
                        console.error('Error saving data:', err);
                        setError('Failed to save. Please try again.');
                        throw err;
                }
        };

        const handleLogin = () => {
                if (passcode === CORRECT_PASSCODE) {
                        setIsAuthenticated(true);
                        setError('');
                } else {
                        setError('Incorrect passcode');
                }
        };

        const handleLoginKeyDown = (e) => {
                if (e.key === 'Enter') {
                        handleLogin();
                }
        };

        const handleNameSubmit = () => {
                if (!tempName.trim()) {
                        setError('Please enter your name');
                        return;
                }
                setCurrentUserName(tempName.trim());
                setTempName('');
                setError('');
        };

        const handleNameKeyDown = (e) => {
                if (e.key === 'Enter') {
                        handleNameSubmit();
                }
        };

        const handleItemClick = (item) => {
                if (actionLoading) return;

                // Item is unclaimed - claim it
                if (!item.claimedBy) {
                        claimItem(item);
                }
                // Item is claimed by current user - show unclaim confirmation
                else if (item.claimedBy === currentUserName) {
                        setSelectedItem(item);
                        setShowUnclaimConfirm(true);
                }
                // Item is claimed by someone else - show message
                else {
                        setSelectedItem(item);
                        setShowNamePrompt(true);
                        setError(`This item is already claimed by ${item.claimedBy}`);
                }
        };

        const claimItem = async (item) => {
                setActionLoading(true);
                try {
                        const newItems = items.map(i =>
                                i.id === item.id
                                        ? { ...i, claimedBy: currentUserName }
                                        : i
                        );

                        await saveData(newItems);
                } catch (err) {
                        setError('Failed to claim item. Please try again.');
                } finally {
                        setActionLoading(false);
                }
        };

        const handleUnclaim = async () => {
                setActionLoading(true);
                try {
                        const newItems = items.map(item =>
                                item.id === selectedItem.id
                                        ? { ...item, claimedBy: null }
                                        : item
                        );

                        await saveData(newItems);

                        setShowUnclaimConfirm(false);
                        setSelectedItem(null);
                } catch (err) {
                        setError('Failed to unclaim item. Please try again.');
                } finally {
                        setActionLoading(false);
                }
        };

        const handleCancelUnclaim = () => {
                setShowUnclaimConfirm(false);
                setSelectedItem(null);
        };

        const handleCloseMessage = () => {
                setShowNamePrompt(false);
                setSelectedItem(null);
                setError('');
        };

        const handleReset = async () => {
                if (window.confirm('Are you sure you want to reset all selections? This cannot be undone.')) {
                        setItems(DEFAULT_ITEMS);
                        await saveData(DEFAULT_ITEMS);
                }
        };

        const handleLogout = () => {
                setCurrentUserName('');
                setTempName('');
        };

        if (loading) {
                return (
                        <div className="center-container">
                                <div className="loading">Loading...</div>
                        </div>
                );
        }

        if (!isAuthenticated) {
                return (
                        <div className="center-container">
                                <div className="card">
                                        <div className="icon-container">
                                                <div className="icon-bg">
                                                        <Lock size={32} />
                                                </div>
                                        </div>
                                        <h1 className="title">Party Selection</h1>
                                        <p className="subtitle">Enter the passcode to continue</p>

                                        <div>
                                                <input
                                                        type="password"
                                                        value={passcode}
                                                        onChange={(e) => setPasscode(e.target.value)}
                                                        onKeyDown={handleLoginKeyDown}
                                                        placeholder="Enter passcode"
                                                        className="input"
                                                />
                                                {error && <p className="error">{error}</p>}
                                                <button onClick={handleLogin} className="button">
                                                        Enter
                                                </button>
                                        </div>
                                </div>
                        </div>
                );
        }

        if (!currentUserName) {
                return (
                        <div className="center-container">
                                <div className="card">
                                        <h1 className="title">Welcome!</h1>
                                        <p className="subtitle">Please enter your name to continue</p>

                                        <div>
                                                <input
                                                        type="text"
                                                        value={tempName}
                                                        onChange={(e) => setTempName(e.target.value)}
                                                        onKeyDown={handleNameKeyDown}
                                                        placeholder="Your name"
                                                        className="input"
                                                        autoFocus
                                                />
                                                {error && <p className="error">{error}</p>}
                                                <button onClick={handleNameSubmit} className="button">
                                                        Continue
                                                </button>
                                        </div>
                                </div>
                        </div>
                );
        }

        if (showUnclaimConfirm) {
                return (
                        <div className="center-container">
                                <div className="card">
                                        <h2 className="title">Unclaim Item?</h2>
                                        <p className="subtitle">Are you sure you want to unclaim "{selectedItem.name}"?</p>

                                        <div className="button-group">
                                                <button onClick={handleCancelUnclaim} className="button button-secondary" disabled={actionLoading}>
                                                        Cancel
                                                </button>
                                                <button onClick={handleUnclaim} className="button button-danger" disabled={actionLoading}>
                                                        {actionLoading ? 'Unclaiming...' : 'Unclaim'}
                                                </button>
                                        </div>
                                </div>
                        </div>
                );
        }

        if (showNamePrompt) {
                return (
                        <div className="center-container">
                                <div className="card">
                                        <h2 className="title">Item Already Claimed</h2>
                                        <p className="subtitle">{error}</p>

                                        <button onClick={handleCloseMessage} className="button">
                                                OK
                                        </button>
                                </div>
                        </div>
                );
        }

        return (
                <div className="app-container">
                        <div className="card card-wide">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
        					<h1 className="title-large" style={{ margin: 0, flex: 1, textAlign: 'center' }}>Xmas Warmup Cocktails</h1>
                                        <button onClick={handleLogout} className="button-icon" title="Change User">
                                                <LogOut size={20} />
                                        </button>
                                </div>
                                <p className="user-greeting">Hello, {currentUserName}!</p>
                                <p className="subtitle">Click an item to claim it. Click your claimed items to unclaim them.</p>
                        </div>

                        <div className="grid">
                                {items.map((item) => (
                                        <div
                                                key={item.id}
                                                onClick={() => handleItemClick(item)}
                                                className={`item-card ${item.claimedBy === currentUserName ? 'item-card-mine' : ''}`}
                                        >
                                                <div className="item-header">
                                                        <h3 className="item-name">{item.name}</h3>
                                                        {item.claimedBy ? (
                                                                <Check size={24} className="check-icon" />
                                                        ) : (
                                                                <div className="unchecked-box"></div>
                                                        )}
                                                </div>
                                                {item.claimedBy && (
                                                        <p className="claimed-by">
                                                                Claimed by: <span className="claimed-by-name">{item.claimedBy}</span>
                                                                {item.claimedBy === currentUserName && <span className="you-tag"> (You)</span>}
                                                        </p>
                                                )}
                                        </div>
                                ))}
                        </div>

                        <div className="summary-card">
                                <h3 className="summary-title">Thanks!</h3>
                                <p className="summary-text">
                                        {items.filter(i => i.claimedBy).length} of {items.length} items claimed
                                </p>
                                <p className="summary-text">
                                        You claimed: {items.filter(i => i.claimedBy === currentUserName).length} items
                                </p>
                        </div>
                </div>
        );
}
