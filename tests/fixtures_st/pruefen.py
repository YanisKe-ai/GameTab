"""Prüft Beispieldaten. Kein Test einer implementierten GameTab-App."""
import json
from pathlib import Path
from collections import defaultdict

def calculate(case):
    stats = {p['id']: {'wins': 0, 'losses': 0} for p in case['participants']}
    pairs = defaultdict(lambda: {'wins': 0, 'losses': 0})
    ids = set()
    for m in case['matches']:
        assert m['id'] not in ids
        ids.add(m['id'])
        people = m['teamA'] + m['teamB']
        assert len(m['teamA']) == len(m['teamB']) == 2
        assert len(set(people)) == 4 and all(p in stats for p in people)
        if m['status'] != 'completed':
            continue
        assert m['winner'] in ('A', 'B')
        for side in ('A', 'B'):
            key = 'wins' if side == m['winner'] else 'losses'
            team = m['team' + side]
            for p in team:
                stats[p][key] += 1
            pairs[tuple(sorted(team))][key] += 1
    for s in stats.values():
        s['points'] = s['wins'] - s['losses']
        s['games'] = s['wins'] + s['losses']
    played = [p for p in stats if stats[p]['games']]
    for p, s in stats.items():
        s['rank'] = 1 + sum(stats[q]['points'] > s['points'] for q in played) if s['games'] else None
    winners = [p for p in played if stats[p]['rank'] == 1]
    partners = {}
    for p in winners:
        won = {next(q for q in pair if q != p): v['wins'] for pair, v in pairs.items() if p in pair and v['wins'] > 0}
        best = max(won.values(), default=0)
        partners[p] = {q: w for q, w in won.items() if w == best}
    count = sum(m['status'] == 'completed' for m in case['matches'])
    assert sum(s['points'] for s in stats.values()) == 0
    assert sum(s['wins'] for s in stats.values()) == count * 2
    assert sum(s['losses'] for s in stats.values()) == count * 2
    return {'stats': stats, 'winners': winners, 'topPartners': partners}

if __name__ == '__main__':
    cases = json.loads(Path(__file__).with_name('faelle.json').read_text())
    for case in cases:
        got = calculate(case)
        for key, value in case['expected'].items():
            if key == 'points':
                assert {p: s['points'] for p, s in got['stats'].items()} == value, case['name']
            elif key == 'unplayed':
                assert [p for p, s in got['stats'].items() if s['rank'] is None] == value, case['name']
            else:
                assert got[key] == value, (case['name'], key)
        print('OK:', case['name'])
