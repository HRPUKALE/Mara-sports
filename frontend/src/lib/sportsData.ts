<<<<<<< HEAD
// Sports data constants and utility functions

export const AGE_CATEGORIES = [
  "U9", "U11", "U13", "U15", "U17", "U19", "U21", "Open"
];

export const GENDER_OPTIONS = [
  "Male", "Female", "Open", "Both"
=======
// Static data for sports management form
// Based on the provided sports categories and age groups

export const AGE_CATEGORIES = [
  "U8", "U9", "U11", "U13", "U15", "U17", "U19", "Open"
];

export const GENDER_OPTIONS = [
  "Male", "Female", "Mixed", "Open"
>>>>>>> 47379439 (improved the admin panel more to go)
];

export const SPORT_TYPES = [
  "Individual", "Team"
];

<<<<<<< HEAD
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
=======
// Team Sports Data
export const TEAM_SPORTS = {
  "Football": {
    name: "Football",
    playerCount: "7-a-side",
    gender: "Boys & Girls",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "7-a-side", ageFrom: "U9", ageTo: "U19" }
>>>>>>> 47379439 (improved the admin panel more to go)
        ]
      }
    }
  },
<<<<<<< HEAD
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
=======
  "Basketball": {
    name: "Basketball", 
    playerCount: "5-a-side",
    gender: "Boys & Girls",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "5-a-side", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Volleyball": {
    name: "Volleyball",
    playerCount: "6-a-side", 
    gender: "Boys & Girls",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    gameFormat: "Best of 3 games (25 points)",
    teamCutoff: "16 teams per age group",
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "6-a-side", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Cricket": {
    name: "Cricket",
    gameFormat: "T6, T15 and T20 format",
    gender: "Boys & Girls", 
    ageGroups: ["U11", "U13", "U15", "U17", "U19"],
    categories: {
      "Formats": {
        name: "Formats",
        subCategories: [
          { name: "T6", ageFrom: "U11", ageTo: "U19" },
          { name: "T15", ageFrom: "U11", ageTo: "U19" },
          { name: "T20", ageFrom: "U11", ageTo: "U19" }
        ]
      }
    }
  },
  "Hockey": {
    name: "Hockey",
    playerCount: "7-a-side",
    gender: "Boys & Girls",
    ageGroups: ["U11", "U13", "U15", "U17", "U19"],
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "7-a-side", ageFrom: "U11", ageTo: "U19" }
        ]
      }
    }
  },
  "Netball": {
    name: "Netball",
    playerCount: "7-a-side with 7 substitutes",
    gender: "Girls only",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    duration: "20 minutes",
    teamCutoff: "16 teams per age group",
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "7-a-side", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Rugby (7s)": {
    name: "Rugby (7s)",
    gender: "Boys & Girls",
    ageGroups: ["U13", "U15", "U17", "U19"],
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "7s", ageFrom: "U13", ageTo: "U19" }
        ]
      }
    }
  },
  "Handball": {
    name: "Handball",
    playerCount: "7-a-side",
    gender: "Boys & Girls", 
    ageGroups: ["U15", "U17", "U19"],
    duration: "20 minutes",
    teamCutoff: "32 teams per age group",
    categories: {
      "General": {
        name: "General",
        subCategories: [
          { name: "7-a-side", ageFrom: "U15", ageTo: "U19" }
>>>>>>> 47379439 (improved the admin panel more to go)
        ]
      }
    }
  }
};

<<<<<<< HEAD
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


=======
// Individual Sports Data with Categories and Sub-Categories
export const INDIVIDUAL_SPORTS = {
  "Athletics": {
    name: "Athletics",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    cutoff: "5 players per discipline per school",
    categories: {
      "Track": {
        name: "Track",
        subCategories: [
          { name: "50m", ageFrom: "U9", ageTo: "U11" },
          { name: "100m", ageFrom: "U9", ageTo: "U19" },
          { name: "200m", ageFrom: "U9", ageTo: "U19" },
          { name: "400m", ageFrom: "U9", ageTo: "U19" },
          { name: "800m", ageFrom: "U9", ageTo: "U19" },
          { name: "1000m", ageFrom: "U9", ageTo: "U19" },
          { name: "1500m", ageFrom: "U9", ageTo: "U19" },
          { name: "3000m", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Hurdles": {
        name: "Hurdles",
        subCategories: [
          { name: "110m", ageFrom: "U9", ageTo: "U19" },
          { name: "200m", ageFrom: "U9", ageTo: "U19" },
          { name: "400m", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Relays": {
        name: "Relays",
        subCategories: [
          { name: "400m", ageFrom: "U9", ageTo: "U19" },
          { name: "800m", ageFrom: "U9", ageTo: "U19" },
          { name: "1600m", ageFrom: "U9", ageTo: "U19" },
          { name: "Mixed Relay", ageFrom: "U9", ageTo: "U19", gender: "Mixed" }
        ]
      },
      "Field": {
        name: "Field",
        subCategories: [
          { name: "High Jump", ageFrom: "U9", ageTo: "U19" },
          { name: "Long Jump", ageFrom: "U9", ageTo: "U19" },
          { name: "Triple Jump", ageFrom: "U9", ageTo: "U19" },
          { name: "Javelin Throw", ageFrom: "U9", ageTo: "U19" },
          { name: "Discus Throw", ageFrom: "U9", ageTo: "U19" },
          { name: "Shot Put", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Swimming": {
    name: "Swimming",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    cutoff: "5 players per discipline per school",
    categories: {
      "Distances": {
        name: "Distances",
        subCategories: [
          { name: "25m", ageFrom: "U9", ageTo: "U19" },
          { name: "50m", ageFrom: "U9", ageTo: "U19" },
          { name: "100m", ageFrom: "U9", ageTo: "U19" },
          { name: "200m", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Strokes": {
        name: "Strokes",
        subCategories: [
          { name: "Freestyle", ageFrom: "U9", ageTo: "U19" },
          { name: "Butterfly", ageFrom: "U9", ageTo: "U19" },
          { name: "Backstroke", ageFrom: "U9", ageTo: "U19" },
          { name: "Breaststroke", ageFrom: "U9", ageTo: "U19" },
          { name: "All Strokes", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Relays": {
        name: "Relays",
        subCategories: [
          { name: "100m", ageFrom: "U9", ageTo: "U19" },
          { name: "200m", ageFrom: "U9", ageTo: "U19" },
          { name: "400m", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Tennis": {
    name: "Tennis",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    rules: "Best of 3 games",
    categories: {
      "Singles": {
        name: "Singles",
        subCategories: [
          { name: "Singles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Doubles": {
        name: "Doubles", 
        subCategories: [
          { name: "Doubles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Mixed Doubles": {
        name: "Mixed Doubles",
        subCategories: [
          { name: "Mixed Doubles", ageFrom: "U9", ageTo: "U19", gender: "Mixed" }
        ]
      },
      "Team": {
        name: "Team",
        subCategories: [
          { name: "Team", ageFrom: "U9", ageTo: "U19", composition: "4 players: 2 boys, 2 girls", gender: "Mixed" }
        ]
      }
    }
  },
  "Badminton": {
    name: "Badminton",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    rules: "Best of 3 games",
    categories: {
      "Singles": {
        name: "Singles",
        subCategories: [
          { name: "Singles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Doubles": {
        name: "Doubles",
        subCategories: [
          { name: "Doubles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Mixed Doubles": {
        name: "Mixed Doubles",
        subCategories: [
          { name: "Mixed Doubles", ageFrom: "U9", ageTo: "U19", gender: "Mixed" }
        ]
      },
      "Team": {
        name: "Team",
        subCategories: [
          { name: "Team", ageFrom: "U9", ageTo: "U19", composition: "4 players: 2 boys, 2 girls", gender: "Mixed" }
        ]
      }
    }
  },
  "Squash": {
    name: "Squash",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    rules: "Best of 3 games",
    categories: {
      "Singles": {
        name: "Singles",
        subCategories: [
          { name: "Singles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Team": {
        name: "Team",
        subCategories: [
          { name: "Team", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Padel": {
    name: "Padel",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    rules: "Best of 3 games",
    categories: {
      "Doubles": {
        name: "Doubles",
        subCategories: [
          { name: "Doubles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Mixed Doubles": {
        name: "Mixed Doubles",
        subCategories: [
          { name: "Mixed Doubles", ageFrom: "U9", ageTo: "U19", gender: "Mixed" }
        ]
      },
      "Team": {
        name: "Team",
        subCategories: [
          { name: "Team", ageFrom: "U9", ageTo: "U19", composition: "4 players: 2 boys, 2 girls", gender: "Mixed" }
        ]
      }
    }
  },
  "Table Tennis": {
    name: "Table Tennis",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    rules: "Best of 3 games",
    categories: {
      "Singles": {
        name: "Singles",
        subCategories: [
          { name: "Singles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Doubles": {
        name: "Doubles",
        subCategories: [
          { name: "Doubles", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Mixed Doubles": {
        name: "Mixed Doubles",
        subCategories: [
          { name: "Mixed Doubles", ageFrom: "U9", ageTo: "U19", gender: "Mixed" }
        ]
      },
      "Team": {
        name: "Team",
        subCategories: [
          { name: "Team", ageFrom: "U9", ageTo: "U19", composition: "4 players: 2 boys, 2 girls", gender: "Mixed" }
        ]
      }
    }
  },
  "Karate": {
    name: "Karate",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "Kata": {
        name: "Kata",
        subCategories: [
          { name: "Kata", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Kumite": {
        name: "Kumite",
        subCategories: [
          { name: "Kumite", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Taekwondo": {
    name: "Taekwondo",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "Kata": {
        name: "Kata",
        subCategories: [
          { name: "Kata", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Kumite": {
        name: "Kumite",
        subCategories: [
          { name: "Kumite", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Chess": {
    name: "Chess",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "Individual": {
        name: "Individual",
        subCategories: [
          { name: "Individual", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  },
  "Judo": {
    name: "Judo",
    ageGroups: ["U9", "U11", "U13", "U15", "U17", "U19"],
    categories: {
      "Kata": {
        name: "Kata",
        subCategories: [
          { name: "Kata", ageFrom: "U9", ageTo: "U19" }
        ]
      },
      "Kumite": {
        name: "Kumite",
        subCategories: [
          { name: "Kumite", ageFrom: "U9", ageTo: "U19" }
        ]
      }
    }
  }
};

// Helper functions
export const getSportsByType = (sportType: string) => {
  if (sportType === "Team") {
    return Object.keys(TEAM_SPORTS);
  } else if (sportType === "Individual") {
    return Object.keys(INDIVIDUAL_SPORTS);
  }
  return [];
};

export const getCategoriesForSport = (sportName: string) => {
  // Check individual sports first
  const individualSport = INDIVIDUAL_SPORTS[sportName as keyof typeof INDIVIDUAL_SPORTS];
  if (individualSport && individualSport.categories) {
    return Object.keys(individualSport.categories);
  }
  
  // Check team sports
  const teamSport = TEAM_SPORTS[sportName as keyof typeof TEAM_SPORTS];
  if (teamSport && teamSport.categories) {
    return Object.keys(teamSport.categories);
  }
  
  return [];
};

export const getSubCategoriesForSportAndCategory = (sportName: string, categoryName: string) => {
  // Check individual sports first
  const individualSport = INDIVIDUAL_SPORTS[sportName as keyof typeof INDIVIDUAL_SPORTS];
  if (individualSport && individualSport.categories && individualSport.categories[categoryName as keyof typeof individualSport.categories]) {
    return individualSport.categories[categoryName as keyof typeof individualSport.categories].subCategories;
  }
  
  // Check team sports
  const teamSport = TEAM_SPORTS[sportName as keyof typeof TEAM_SPORTS];
  if (teamSport && teamSport.categories && teamSport.categories[categoryName as keyof typeof teamSport.categories]) {
    return teamSport.categories[categoryName as keyof typeof teamSport.categories].subCategories;
  }
  
  return [];
};

export const getAgeGroupsForSport = (sportName: string, sportType: string) => {
  if (sportType === "Team") {
    const sport = TEAM_SPORTS[sportName as keyof typeof TEAM_SPORTS];
    return sport ? sport.ageGroups : AGE_CATEGORIES;
  } else if (sportType === "Individual") {
    const sport = INDIVIDUAL_SPORTS[sportName as keyof typeof INDIVIDUAL_SPORTS];
    return sport ? sport.ageGroups : AGE_CATEGORIES;
  }
  return AGE_CATEGORIES;
};
>>>>>>> 47379439 (improved the admin panel more to go)
