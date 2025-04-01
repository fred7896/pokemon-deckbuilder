import { normalize } from '../components/DeckUtils';

export function getEvolutionLine(card, allCards) {
    const line = [];

    // Remonte la chaîne d'évolution
    let current = card;
    while (current.prew_stage_name) {
        const prev = allCards.find(c => normalize(c.name) === normalize(current.prew_stage_name));
        if (!prev) break;
        line.unshift(prev);
        current = prev;
    }

    // Puis ajoute le Pokémon lui-même
    line.push(card);

    // Et ses évolutions (optionnel)
    let evolutions = allCards.filter(c => normalize(c.prew_stage_name) === normalize(card.name));
    for (const evo of evolutions) {
        line.push(evo);
    }

    return [...new Set(line)];
}
