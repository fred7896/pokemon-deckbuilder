// src/views/CardListView.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCards } from '../store/cardsSlice';
import { Link } from 'react-router-dom';
import CardDisplay from '../components/CardDisplay';

const CardListView = () => {
    const dispatch = useDispatch();
    const { allCards, status, error } = useSelector((state) => state.cards);

    useEffect(() => {
        dispatch(fetchCards());
    }, [dispatch]);

    return (
        <div className="container">
            <h1>Liste des Cartes</h1>
            <div className="actions">
                <Link className="btn" to="/deckbuilder">Deck Builder</Link>
                <Link className="btn" to="/meta">Meta</Link>
            </div>
            {status === 'loading' && <p>Chargement...</p>}
            {status === 'failed' && <p>Erreur : {error}</p>}

            <div className="grid">
            {allCards.map((card, index) => (
                <CardDisplay key={index} card={card} minimal={true} />
            ))}
            </div>
        </div>
        );
};

export default CardListView;
