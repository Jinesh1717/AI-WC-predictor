import pdfplumber
import json
import sys
import os
import re

pdf_path = os.path.join(os.getcwd(), '../SquadLists-English.pdf')

def get_flag_emoji(country_code):
    if country_code == 'ENG': return '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
    if country_code == 'SCO': return '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
    if country_code == 'WAL': return '🏴󠁧󠁢󠁷󠁬󠁳󠁿'
    # Use standard letters to regional indicators
    code_points = [127397 + ord(char) for char in country_code.upper()]
    return ''.join(chr(cp) for cp in code_points)

country_to_iso = {
  'ARG': 'AR', 'FRA': 'FR', 'BRA': 'BR', 'ENG': 'GB-ENG', 'ESP': 'ES', 'POR': 'PT',
  'ALG': 'DZ', 'AUS': 'AU', 'AUT': 'AT', 'BEL': 'BE', 'BIH': 'BA', 'CPV': 'CV',
  'CAN': 'CA', 'COL': 'CO', 'COD': 'CD', 'CIV': 'CI', 'CRO': 'HR', 'CUW': 'CW',
  'CZE': 'CZ', 'ECU': 'EC', 'EGY': 'EG', 'IRN': 'IR', 'IRQ': 'IQ', 'JPN': 'JP',
  'JOR': 'JO', 'KOR': 'KR', 'MEX': 'MX', 'MAR': 'MA', 'NED': 'NL', 'NZL': 'NZ',
  'NOR': 'NO', 'PAN': 'PA', 'PAR': 'PY', 'QAT': 'QA', 'KSA': 'SA', 'SCO': 'GB-SCT',
  'SEN': 'SN', 'RSA': 'ZA', 'SWE': 'SE', 'SUI': 'CH', 'TUN': 'TN', 'TUR': 'TR',
  'URU': 'UY', 'USA': 'US', 'UZB': 'UZ'
}

teams = []
players = []

with pdfplumber.open(pdf_path) as pdf:
    ranking_counter = 1
    for page in pdf.pages:
        # Extract plain text to find Team name and Coach
        text = page.extract_text()
        lines = text.split('\n')
        
        current_team_name = ""
        current_team_id = ""
        current_coach = "Unknown"

        for line in lines:
            team_match = re.match(r'^([A-Za-z\s\'üéáíóúçñã]+)\s+\(([A-Z]{3})\)$', line.strip())
            if team_match and "FIFA" not in line:
                current_team_name = team_match.group(1).strip()
                current_team_id = team_match.group(2).strip()
            if "Head coach" in line:
                parts = line.split()
                if len(parts) >= 4:
                    current_coach = f"{parts[2]} {parts[3]}"
        
        if not current_team_id:
            continue

        iso_code = country_to_iso.get(current_team_id, current_team_id[:2])
        flag = '🏴󠁧󠁢󠁥󠁮󠁧󠁿' if iso_code == 'GB-ENG' else '🏴󠁧󠁢󠁳󠁣󠁴󠁿' if iso_code == 'GB-SCT' else get_flag_emoji(iso_code)

        team = {
            "id": current_team_id,
            "name": current_team_name,
            "coach": current_coach,
            "ranking": ranking_counter,
            "flag": flag,
            "formation": "4-3-3",
            "stats": {
                "goalsScored": 15, "goalsConceded": 5, "winRate": 60,
                "recentForm": [1, 1, 0, -1, 1],
                "attack": 80, "defense": 80, "midfield": 80, "experience": 80, "benchStrength": 80, "fitness": 80
            }
        }
        teams.append(team)
        ranking_counter += 1

        # Extract table data (players)
        tables = page.extract_tables()
        if tables:
            for table in tables:
                if len(table) > 1 and "PLAYER NAME" in str(table[0]):
                    # Row contains: [0:Num, 1:POS, 2:Player Name, ..., 7:DOB, 8:Club, 9:Height, 10:Caps, 11:Goals]
                    for row in table[1:]:
                        if not row or not row[1]: continue
                        pos = str(row[1]).strip()
                        if pos not in ['GK', 'DF', 'MF', 'FW']: continue
                        
                        full_name = str(row[2]).strip().replace('\n', ' ')
                        name_words = full_name.split()
                        short_name = " ".join(name_words[:2]) if len(name_words) > 1 else name_words[0]
                        
                        try:
                            height = int(row[-3])
                            caps = int(row[-2])
                            goals = int(row[-1])
                        except:
                            height, caps, goals = 180, 0, 0

                        rating = int(70 + min(20, caps / 5.0) + min(9, goals))
                        is_star = rating > 85

                        players.append({
                            "id": f"p_{current_team_id}_{len(players)}",
                            "teamId": current_team_id,
                            "name": short_name,
                            "position": pos,
                            "caps": caps,
                            "goals": goals,
                            "height": height,
                            "dob": str(row[7]).replace('\n', '') if row[7] else '2000-01-01',
                            "club": str(row[8]).replace('\n', ' ') if row[8] else 'Unknown',
                            "rating": rating,
                            "isStarPlayer": is_star
                        })

# Post-process Team ratings based on average player ratings
for team in teams:
    team_players = [p for p in players if p["teamId"] == team["id"]]
    if team_players:
        avg_rating = sum(p["rating"] for p in team_players) / len(team_players)
        attackers = [p for p in team_players if p["position"] == 'FW']
        defenders = [p for p in team_players if p["position"] in ['DF', 'GK']]
        midfielders = [p for p in team_players if p["position"] == 'MF']

        team["stats"]["attack"] = int(sum(p["rating"] for p in attackers) / len(attackers)) if attackers else int(avg_rating)
        team["stats"]["defense"] = int(sum(p["rating"] for p in defenders) / len(defenders)) if defenders else int(avg_rating)
        team["stats"]["midfield"] = int(sum(p["rating"] for p in midfielders) / len(midfielders)) if midfielders else int(avg_rating)
        team["stats"]["experience"] = int(sum(min(100, p["caps"] * 2) for p in team_players) / len(team_players))

with open(os.path.join(os.getcwd(), 'src/data/realTeams.json'), 'w', encoding='utf-8') as f:
    json.dump(teams, f, ensure_ascii=False, indent=2)

with open(os.path.join(os.getcwd(), 'src/data/realPlayers.json'), 'w', encoding='utf-8') as f:
    json.dump(players, f, ensure_ascii=False, indent=2)

print(f"Parsed {len(teams)} teams and {len(players)} players successfully via pdfplumber!")
