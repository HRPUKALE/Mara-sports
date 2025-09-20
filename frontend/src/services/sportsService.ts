/**
 * Sports Service for Mara Sports Festival
 * Handles sports and registration data
 */

import apiService from './api';

export interface Sport {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: 'Team Sport' | 'Individual';
  fee: number;
  maxTeamSize: number;
  subcategories: SportCategory[];
  registrationDeadline: string;
  eventDate: string;
  minParticipants: number;
  maxParticipants: number;
}

export interface SportCategory {
  id: string;
  name: string;
  category: string;
  fee: number;
  participants: number;
  age_from: number;
  age_to: number;
  gender_allowed: 'male' | 'female' | 'mixed';
  max_participants?: number;
}

class SportsService {
  private sportsCache: Sport[] | null = null;
  private categoriesCache: { [sportId: string]: SportCategory[] } = {};

  async getSports(): Promise<Sport[]> {
    if (this.sportsCache) {
      return this.sportsCache;
    }

    try {
      const response = await apiService.getSports();
      const sports = response.data;
      
      // Transform backend data to frontend format
      this.sportsCache = sports.map((sport: any) => ({
        id: sport.id,
        name: sport.name,
        slug: sport.slug,
        description: sport.description,
        type: this.determineSportType(sport.name),
        fee: 0, // Will be updated with categories
        maxTeamSize: this.getMaxTeamSize(sport.name),
        subcategories: [], // Will be loaded separately
        registrationDeadline: '2024-02-20',
        eventDate: '2024-03-15',
        minParticipants: 2,
        maxParticipants: 20
      }));

      // Load categories for each sport
      for (const sport of this.sportsCache) {
        sport.subcategories = await this.getSportCategories(sport.id);
        sport.fee = Math.min(...sport.subcategories.map(cat => cat.fee));
      }

      return this.sportsCache;
    } catch (error) {
      console.error('Failed to fetch sports:', error);
      return this.getMockSports();
    }
  }

  async getSportCategories(sportId: string): Promise<SportCategory[]> {
    if (this.categoriesCache[sportId]) {
      return this.categoriesCache[sportId];
    }

    try {
      const response = await apiService.getSportCategories(sportId);
      const categories = response.data;
      
      this.categoriesCache[sportId] = categories.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        category: this.getCategoryType(cat.name, cat.gender_allowed),
        fee: cat.fee,
        participants: 0, // Will be updated with real data
        age_from: cat.age_from,
        age_to: cat.age_to,
        gender_allowed: cat.gender_allowed,
        max_participants: cat.max_participants
      }));

      return this.categoriesCache[sportId];
    } catch (error) {
      console.error('Failed to fetch sport categories:', error);
      return [];
    }
  }

  async registerForSport(registrationData: {
    studentId: string;
    sportCategoryId: string;
    teamDetails?: {
      teamName: string;
      captainName: string;
      captainPhone: string;
      members: string[];
    };
  }) {
    try {
      const response = await apiService.createRegistration(registrationData);
      return response.data;
    } catch (error) {
      console.error('Failed to register for sport:', error);
      throw error;
    }
  }

  private determineSportType(sportName: string): 'Team Sport' | 'Individual' {
    const teamSports = ['Football', 'Basketball', 'Cricket', 'Volleyball', 'Hockey', 'Rugby'];
    return teamSports.includes(sportName) ? 'Team Sport' : 'Individual';
  }

  private getMaxTeamSize(sportName: string): number {
    const teamSizes: { [key: string]: number } = {
      'Football': 11,
      'Basketball': 5,
      'Cricket': 11,
      'Volleyball': 6,
      'Hockey': 11,
      'Rugby': 15,
      'Tennis': 1,
      'Badminton': 1,
      'Swimming': 1,
      'Athletics': 1
    };
    return teamSizes[sportName] || 1;
  }

  private getCategoryType(name: string, gender: string): string {
    if (name.includes('Under')) {
      return name.replace('Under', '').trim();
    }
    return gender === 'mixed' ? 'Mixed' : gender.charAt(0).toUpperCase() + gender.slice(1);
  }

  private getMockSports(): Sport[] {
    return [
      {
        id: '1',
        name: 'Football',
        slug: 'football',
        type: 'Team Sport',
        fee: 150,
        maxTeamSize: 11,
        subcategories: [
          { id: '11', name: 'Under 16 Boys', category: '16', fee: 500, participants: 0, age_from: 12, age_to: 16, gender_allowed: 'male' },
          { id: '12', name: 'Under 16 Girls', category: '16', fee: 500, participants: 0, age_from: 12, age_to: 16, gender_allowed: 'female' },
          { id: '13', name: 'Under 19 Boys', category: '19', fee: 750, participants: 0, age_from: 16, age_to: 19, gender_allowed: 'male' },
          { id: '14', name: 'Under 19 Girls', category: '19', fee: 750, participants: 0, age_from: 16, age_to: 19, gender_allowed: 'female' },
          { id: '15', name: 'Senior Men', category: 'Senior', fee: 1000, participants: 0, age_from: 19, age_to: 25, gender_allowed: 'male' },
          { id: '16', name: 'Senior Women', category: 'Senior', fee: 1000, participants: 0, age_from: 19, age_to: 25, gender_allowed: 'female' }
        ],
        description: 'Association football/soccer',
        registrationDeadline: '2024-02-20',
        eventDate: '2024-03-15',
        minParticipants: 2,
        maxParticipants: 20
      },
      {
        id: '2',
        name: 'Basketball',
        slug: 'basketball',
        type: 'Team Sport',
        fee: 120,
        maxTeamSize: 5,
        subcategories: [
          { id: '21', name: 'Under 16 Boys', category: '16', fee: 400, participants: 0, age_from: 12, age_to: 16, gender_allowed: 'male' },
          { id: '22', name: 'Under 16 Girls', category: '16', fee: 400, participants: 0, age_from: 12, age_to: 16, gender_allowed: 'female' },
          { id: '23', name: 'Under 19 Boys', category: '19', fee: 600, participants: 0, age_from: 16, age_to: 19, gender_allowed: 'male' },
          { id: '24', name: 'Under 19 Girls', category: '19', fee: 600, participants: 0, age_from: 16, age_to: 19, gender_allowed: 'female' }
        ],
        description: 'Basketball sport',
        registrationDeadline: '2024-02-25',
        eventDate: '2024-03-20',
        minParticipants: 2,
        maxParticipants: 15
      },
      {
        id: '3',
        name: 'Tennis',
        slug: 'tennis',
        type: 'Individual',
        fee: 80,
        maxTeamSize: 1,
        subcategories: [
          { id: '31', name: 'Under 16 Boys', category: '16', fee: 300, participants: 0, age_from: 12, age_to: 16, gender_allowed: 'male' },
          { id: '32', name: 'Under 16 Girls', category: '16', fee: 300, participants: 0, age_from: 12, age_to: 16, gender_allowed: 'female' },
          { id: '33', name: 'Under 19 Boys', category: '19', fee: 400, participants: 0, age_from: 16, age_to: 19, gender_allowed: 'male' },
          { id: '34', name: 'Under 19 Girls', category: '19', fee: 400, participants: 0, age_from: 16, age_to: 19, gender_allowed: 'female' }
        ],
        description: 'Tennis sport',
        registrationDeadline: '2024-02-28',
        eventDate: '2024-03-25',
        minParticipants: 4,
        maxParticipants: 8
      },
      {
        id: '4',
        name: 'Cricket',
        slug: 'cricket',
        type: 'Team Sport',
        fee: 200,
        maxTeamSize: 11,
        subcategories: [
          { id: '41', name: 'Under 16 Boys', category: '16', fee: 600, participants: 0, age_from: 12, age_to: 16, gender_allowed: 'male' },
          { id: '42', name: 'Under 19 Boys', category: '19', fee: 800, participants: 0, age_from: 16, age_to: 19, gender_allowed: 'male' },
          { id: '43', name: 'Senior Men', category: 'Senior', fee: 1200, participants: 0, age_from: 19, age_to: 25, gender_allowed: 'male' }
        ],
        description: 'Cricket sport',
        registrationDeadline: '2024-02-22',
        eventDate: '2024-03-18',
        minParticipants: 4,
        maxParticipants: 16
      },
      {
        id: '5',
        name: 'Badminton',
        slug: 'badminton',
        type: 'Individual',
        fee: 60,
        maxTeamSize: 1,
        subcategories: [
          { id: '51', name: 'Under 16 Boys', category: '16', fee: 250, participants: 0, age_from: 12, age_to: 16, gender_allowed: 'male' },
          { id: '52', name: 'Under 16 Girls', category: '16', fee: 250, participants: 0, age_from: 12, age_to: 16, gender_allowed: 'female' },
          { id: '53', name: 'Under 19 Boys', category: '19', fee: 350, participants: 0, age_from: 16, age_to: 19, gender_allowed: 'male' },
          { id: '54', name: 'Under 19 Girls', category: '19', fee: 350, participants: 0, age_from: 16, age_to: 19, gender_allowed: 'female' }
        ],
        description: 'Badminton sport',
        registrationDeadline: '2024-03-01',
        eventDate: '2024-03-30',
        minParticipants: 8,
        maxParticipants: 16
      }
    ];
  }
}

export const sportsService = new SportsService();
export default sportsService;
