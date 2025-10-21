import type { Tournament, Standings, Match } from '../types';

/**
 * Converte la classifica in formato CSV
 */
export function exportStandingsToCSV(standings: Standings): string {
  const headers = ['Pos', 'Nome', 'Rating', 'Δ Rating', 'P', 'W', 'L', 'SV', 'SP', 'ΔS', 'Punti'];
  const rows = standings.stats.map((stat, index) => [
    (index + 1).toString(),
    stat.playerName,
    stat.rating.toString(),
    (stat.ratingChange >= 0 ? '+' : '') + stat.ratingChange.toString(),
    stat.played.toString(),
    stat.wins.toString(),
    stat.losses.toString(),
    stat.setsWon.toString(),
    stat.setsLost.toString(),
    (stat.setDiff >= 0 ? '+' : '') + stat.setDiff.toString(),
    stat.points.toString(),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Converte i risultati dei match in formato CSV
 */
export function exportMatchesToCSV(matches: Match[]): string {
  const headers = ['Match ID', 'Round', 'Team 1 P1', 'Team 1 P2', 'Team 2 P1', 'Team 2 P2', 'Risultato', 'Rating Changes'];
  const rows = matches.map((match) => {
    const result = match.result
      ? `${match.result.team1Score}–${match.result.team2Score}`
      : 'Da giocare';

    const ratingChanges = match.result?.ratingChanges
      ? Object.entries(match.result.ratingChanges)
          .map(([id, change]) => {
            const player1Name = match.team1.player1.id === id ? match.team1.player1.name :
                               match.team1.player2.id === id ? match.team1.player2.name :
                               match.team2.player1.id === id ? match.team2.player1.name :
                               match.team2.player2.name;
            return `${player1Name}: ${change >= 0 ? '+' : ''}${Math.round(change)}`;
          })
          .join('; ')
      : '';

    return [
      match.id,
      match.roundNumber.toString(),
      match.team1.player1.name,
      match.team1.player2.name,
      match.team2.player1.name,
      match.team2.player2.name,
      result,
      ratingChanges,
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Esporta il torneo completo in formato CSV
 */
export function exportTournamentToCSV(tournament: Tournament, standings: Standings): string {
  let content = `"Torneo: ${tournament.name}"\n\n`;

  content += '"=== CLASSIFICA ==="\n';
  content += exportStandingsToCSV(standings);
  content += '\n\n';

  content += '"=== RISULTATI PARTITE ==="\n';
  content += exportMatchesToCSV(tournament.matches);

  return content;
}

/**
 * Scarica un file CSV
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
