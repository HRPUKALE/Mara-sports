// Sports data constants and utility functions

export const AGE_CATEGORIES = [
  "U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"
];

export const GENDER_OPTIONS = [
  "Male", "Female", "Open", "Both"
];

export const SPORT_TYPES = [
  "Individual", "Team"
];

export const TEAM_SPORTS = [
  "Football", "Basketball", "Volleyball", "Cricket", "Hockey", "Baseball", "Soccer", "Rugby"
];

export const INDIVIDUAL_SPORTS = [
  "Athletics", "Swimming", "Tennis", "Badminton", "Table Tennis", "Chess", "Boxing", "Wrestling", "Weightlifting", "Gymnastics", "Cycling", "Running", "Javelin", "Shot Put", "Long Jump", "High Jump", "Discus", "Pole Vault", "Triple Jump", "Marathon", "Sprint", "Hurdles", "Relay", "Golf", "Archery", "Shooting", "Karate", "Taekwondo", "Judo", "Fencing", "Squash", "Racquetball", "Bowling", "Darts", "Snooker", "Billiards"
];

// Sports data structure
export const SPORTS_DATA = {
  "Individual": {
    "Athletics": {
      categories: ["Track", "Field", "Road"],
      subCategories: {
        "Track": [
          { name: "100m", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "200m", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "400m", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "800m", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "1500m", ageGroups: ["U15", "U17", "U19", "U21", "Open"] },
          { name: "5000m", ageGroups: ["U17", "U19", "U21", "Open"] },
          { name: "10000m", ageGroups: ["U19", "U21", "Open"] },
          { name: "Marathon", ageGroups: ["U21", "Open"] },
          { name: "110m Hurdles", ageGroups: ["U15", "U17", "U19", "U21", "Open"] },
          { name: "400m Hurdles", ageGroups: ["U17", "U19", "U21", "Open"] },
          { name: "3000m Steeplechase", ageGroups: ["U19", "U21", "Open"] },
          { name: "4x100m Relay", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "4x400m Relay", ageGroups: ["U15", "U17", "U19", "U21", "Open"] }
        ],
        "Field": [
          { name: "Long Jump", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "High Jump", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Triple Jump", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Pole Vault", ageGroups: ["U15", "U17", "U19", "U21", "Open"] },
          { name: "Shot Put", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Discus", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Javelin", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Hammer", ageGroups: ["U17", "U19", "U21", "Open"] }
        ],
        "Road": [
          { name: "5K Run", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "10K Run", ageGroups: ["U15", "U17", "U19", "U21", "Open"] },
          { name: "Half Marathon", ageGroups: ["U17", "U19", "U21", "Open"] },
          { name: "Marathon", ageGroups: ["U19", "U21", "Open"] }
        ]
      }
    },
    "Swimming": {
      categories: ["Freestyle", "Backstroke", "Breaststroke", "Butterfly", "Individual Medley", "Relay"],
      subCategories: {
        "Freestyle": [
          { name: "50m", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "100m", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "200m", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "400m", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "800m", ageGroups: ["U15", "U17", "U19", "U21", "Open"] },
          { name: "1500m", ageGroups: ["U17", "U19", "U21", "Open"] }
        ],
        "Backstroke": [
          { name: "50m", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "100m", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "200m", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Breaststroke": [
          { name: "50m", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "100m", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "200m", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Butterfly": [
          { name: "50m", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "100m", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "200m", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Individual Medley": [
          { name: "200m", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "400m", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Relay": [
          { name: "4x50m Freestyle", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "4x100m Freestyle", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "4x200m Freestyle", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "4x100m Medley", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ]
      }
    },
    "Tennis": {
      categories: ["Singles", "Doubles", "Mixed Doubles"],
      subCategories: {
        "Singles": [
          { name: "Men's Singles", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Singles", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Doubles": [
          { name: "Men's Doubles", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Doubles", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Mixed Doubles": [
          { name: "Mixed Doubles", ageGroups: ["U15", "U17", "U19", "U21", "Open"] }
        ]
      }
    },
    "Badminton": {
      categories: ["Singles", "Doubles", "Mixed Doubles"],
      subCategories: {
        "Singles": [
          { name: "Men's Singles", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Singles", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Doubles": [
          { name: "Men's Doubles", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Doubles", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Mixed Doubles": [
          { name: "Mixed Doubles", ageGroups: ["U15", "U17", "U19", "U21", "Open"] }
        ]
      }
    },
    "Table Tennis": {
      categories: ["Singles", "Doubles", "Mixed Doubles"],
      subCategories: {
        "Singles": [
          { name: "Men's Singles", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Singles", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Doubles": [
          { name: "Men's Doubles", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Doubles", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Mixed Doubles": [
          { name: "Mixed Doubles", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] }
        ]
      }
    },
    "Chess": {
      categories: ["Classical", "Rapid", "Blitz"],
      subCategories: {
        "Classical": [
          { name: "Men's Classical", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Classical", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Rapid": [
          { name: "Men's Rapid", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Rapid", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Blitz": [
          { name: "Men's Blitz", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Blitz", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ]
      }
    }
  },
  "Team": {
    "Football": {
      categories: ["11-a-side", "7-a-side", "5-a-side"],
      subCategories: {
        "11-a-side": [
          { name: "Men's 11-a-side", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's 11-a-side", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "7-a-side": [
          { name: "Men's 7-a-side", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's 7-a-side", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "5-a-side": [
          { name: "Men's 5-a-side", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's 5-a-side", ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ]
      }
    },
    "Basketball": {
      categories: ["5v5", "3v3"],
      subCategories: {
        "5v5": [
          { name: "Men's 5v5", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's 5v5", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "3v3": [
          { name: "Men's 3v3", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's 3v3", ageGroups: ["U11", "U13", "U15", "U17", "U19", "U21", "Open"] }
        ]
      }
    },
    "Volleyball": {
      categories: ["Indoor", "Beach"],
      subCategories: {
        "Indoor": [
          { name: "Men's Indoor", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Indoor", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "Beach": [
          { name: "Men's Beach", ageGroups: ["U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's Beach", ageGroups: ["U15", "U17", "U19", "U21", "Open"] }
        ]
      }
    },
    "Cricket": {
      categories: ["T20", "ODI", "Test"],
      subCategories: {
        "T20": [
          { name: "Men's T20", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] },
          { name: "Women's T20", ageGroups: ["U13", "U15", "U17", "U19", "U21", "Open"] }
        ],
        "ODI": [
          { name: "Men's ODI", ageGroups: ["U17", "U19", "U21", "Open"] },
          { name: "Women's ODI", ageGroups: ["U17", "U19", "U21", "Open"] }
        ],
        "Test": [
          { name: "Men's Test", ageGroups: ["U19", "U21", "Open"] },
          { name: "Women's Test", ageGroups: ["U19", "U21", "Open"] }
        ]
      }
    }
  }
};

// Utility functions
export function getSportsByType(type: string): string[] {
  if (type === "Individual") {
    return INDIVIDUAL_SPORTS;
  } else if (type === "Team") {
    return TEAM_SPORTS;
  }
  return [];
}

export function getCategoriesForSport(sport: string): string[] {
  // Find sport in data structure
  for (const sportType in SPORTS_DATA) {
    if (SPORTS_DATA[sportType as keyof typeof SPORTS_DATA][sport as keyof typeof SPORTS_DATA[typeof sportType]]) {
      return SPORTS_DATA[sportType as keyof typeof SPORTS_DATA][sport as keyof typeof SPORTS_DATA[typeof sportType]].categories;
    }
  }
  return [];
}

export function getSubCategoriesForSportAndCategory(sport: string, category: string): Array<{name: string, ageGroups: string[]}> {
  // Find sport in data structure
  for (const sportType in SPORTS_DATA) {
    const sportData = SPORTS_DATA[sportType as keyof typeof SPORTS_DATA][sport as keyof typeof SPORTS_DATA[typeof sportType]];
    if (sportData && sportData.subCategories && sportData.subCategories[category]) {
      return sportData.subCategories[category];
    }
  }
  return [];
}

export function getAgeGroupsForSport(sport: string, type: string): string[] {
  // Find sport in data structure and get all unique age groups
  const ageGroups = new Set<string>();
  
  for (const sportType in SPORTS_DATA) {
    const sportData = SPORTS_DATA[sportType as keyof typeof SPORTS_DATA][sport as keyof typeof SPORTS_DATA[typeof sportType]];
    if (sportData && sportData.subCategories) {
      for (const category in sportData.subCategories) {
        for (const subCategory of sportData.subCategories[category]) {
          subCategory.ageGroups.forEach(age => ageGroups.add(age));
        }
      }
    }
  }
  
  // If no specific age groups found, return default categories
  if (ageGroups.size === 0) {
    return AGE_CATEGORIES;
  }
  
  return Array.from(ageGroups).sort((a, b) => {
    const aNum = parseInt(a.replace('U', '')) || 999;
    const bNum = parseInt(b.replace('U', '')) || 999;
    return aNum - bNum;
  });
}


