// src/views/CardListView.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCards } from '../store/cardsSlice';
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
