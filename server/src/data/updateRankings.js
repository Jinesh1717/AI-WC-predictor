const fs = require('fs');
const path = require('path');

const rankingsData = `
1st Argentina
2nd Spain
3rd France
4th England
5th Portugal
6th Brazil
7th Morocco
8th Netherlands
9th Belgium
10th Germany
11th Croatia
12th Italy
13th Colombia
14th Mexico
15th Senegal
16th Uruguay
17th USA
18th Japan
19th Switzerland
20th Iran
21st Denmark
22nd Türkiye
23rd Ecuador
24th Austria
25th South Korea
26th Nigeria
27th Australia
28th Algeria
29th Egypt
30th Canada
31st Norway
32nd Ukraine
33rd Côte d'Ivoire
34th Panama
35th Russia
36th Poland
37th Wales
38th Sweden
39th Hungary
40th Czechia
41st Paraguay
42nd Scotland
43rd Serbia
44th Cameroon
45th Tunisia
46th DR Congo
47th Slovakia
48th Greece
49th Venezuela
50th Uzbekistan
51st Chile
52nd Peru
53rd Costa Rica
54th Romania
55th Mali
56th Qatar
57th Iraq
58th Ireland
59th Slovenia
60th South Africa
61st Saudi Arabia
62nd Burkina Faso
63rd Jordan
64th Bosnia & Herzegovina
65th Honduras
66th Albania
67th Cape Verde
68th United Arab Emirates
69th North Macedonia
70th Northern Ireland
71st Jamaica
72nd Georgia
73rd Ghana
74th Iceland
75th Finland
76th Israel
77th Bolivia
78th Kosovo
79th Oman
80th Montenegro
81st Guinea
82nd Curaçao
83rd Haiti
84th Syria
`;

// Parse rankings
const rankingMap = {};
rankingsData.trim().split('\n').forEach(line => {
    const match = line.trim().match(/^(\d+)(?:st|nd|rd|th)\s+(.+)$/);
    if (match) {
        let rank = parseInt(match[1]);
        let name = match[2].trim();
        rankingMap[name.toLowerCase()] = rank;
    }
});

const teamsPath = path.join(__dirname, 'realTeams.json');
const teams = JSON.parse(fs.readFileSync(teamsPath, 'utf8'));

teams.forEach(t => {
    const searchName = t.name.toLowerCase();
    let rank = rankingMap[searchName];
    // Special cases
    if (!rank) {
        if (searchName.includes('korea republic')) rank = 25;
        if (searchName.includes('usa')) rank = 17;
        if (searchName.includes('bosnia')) rank = 64;
    }
    if (rank) {
        t.ranking = rank;
    }
});

// Sort teams by ranking
teams.sort((a, b) => a.ranking - b.ranking);

fs.writeFileSync(teamsPath, JSON.stringify(teams, null, 2));
console.log('Rankings updated!');
