/**
 * API Service for Mara Sports Festival
 * Handles all backend communication
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Surface server error details when available
        const serverMsg = (data && (data.detail || data.message || data.error)) as string | undefined;
        throw new Error(serverMsg || `HTTP error! status: ${response.status}`);
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async sendOTP(email: string, role: string) {
    return this.request('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ 
        email: email, 
        purpose: 'login'
      }),
    });
  }

  async verifyOTP(otpId: string, otp: string) {
    return this.request('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ 
        otp_id: otpId,
        code: otp 
      }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Student APIs
  async getStudents(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/students${query}`);
  }

  async getStudent(id: string) {
    return this.request(`/students/${id}`);
  }

  async createStudent(studentData: any) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  }

  async updateStudent(id: string, studentData: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  }

  // Institution APIs
  async getInstitutions(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/institutions${query}`);
  }

  async getInstitution(id: string) {
    return this.request(`/institutions/${id}`);
  }

  async createInstitution(institutionData: any) {
    return this.request('/institutions', {
      method: 'POST',
      body: JSON.stringify(institutionData),
    });
  }

  async updateInstitution(id: string, institutionData: any) {
    return this.request(`/institutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(institutionData),
    });
  }

  // Sports APIs
  async getSports(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/sports${query}`);
  }

  async getSport(id: string) {
    return this.request(`/sports/${id}`);
  }

  async getSportCategories(sportId: string) {
    return this.request(`/sports/${sportId}/categories`);
  }

  // Registration APIs
  async createRegistration(registrationData: any) {
    return this.request('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  async getRegistrations(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/registrations${query}`);
  }

  // Payment APIs
  async createPayment(paymentData: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPayments(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/payments${query}`);
  }

  // Sponsorship APIs
  async createSponsorship(sponsorshipData: any) {
    return this.request('/sponsorships', {
      method: 'POST',
      body: JSON.stringify(sponsorshipData),
    });
  }

  async getSponsorships(params?: { skip?: number; limit?: number }) {
    const query = params ? `?${new URLSearchParams(params as any)}` : '';
    return this.request(`/sponsorships${query}`);
  }

  // Dashboard APIs
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  // Health check
  async healthCheck() {
    return this.request('/healthz');
  }

  // --- Admin Dashboard Endpoints ---
  async getAdminDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  async getAdminInstitutions(params?: { search?: string; sport?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sport) queryParams.append('sport', params.sport);
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    return this.request(`/admin/institutions${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminStudents(params?: { search?: string; institution?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.institution) queryParams.append('institution', params.institution);
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    return this.request(`/admin/students${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminPayments(params?: { search?: string; status?: string; dateFrom?: string; dateTo?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.dateFrom) queryParams.append('date_from', params.dateFrom);
    if (params?.dateTo) queryParams.append('date_to', params.dateTo);
    
    const queryString = queryParams.toString();
    return this.request(`/admin/payments${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminInvoices(params?: { search?: string; status?: string; institution?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.institution) queryParams.append('institution', params.institution);
    
    const queryString = queryParams.toString();
    return this.request(`/admin/invoices${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminSports() {
    return this.request('/admin/sports');
  }

  async createSport(sportData: any) {
    return this.request('/sports', {
      method: 'POST',
      body: JSON.stringify(sportData)
    });
  }

  async updateSport(sportId: string, sportData: any) {
    return this.request(`/sports/${sportId}`, {
      method: 'PUT',
      body: JSON.stringify(sportData)
    });
  }

  async deleteSport(sportId: string) {
    return this.request(`/sports/${sportId}`, {
      method: 'DELETE'
    });
  }

  async addSubCategory(sportId: string, subCategoryData: any) {
    return this.request(`/sports/${sportId}/subcategories`, {
      method: 'POST',
      body: JSON.stringify(subCategoryData)
    });
  }

  async updateSubCategory(subCategoryId: string, subCategoryData: any) {
    return this.request(`/subcategories/${subCategoryId}`, {
      method: 'PUT',
      body: JSON.stringify(subCategoryData)
    });
  }

  async deleteSubCategory(subCategoryId: string) {
    return this.request(`/subcategories/${subCategoryId}`, {
      method: 'DELETE'
    });
  }

  async getAdminSponsorships() {
    return this.request('/admin/sponsorships');
  }

  // --- Student Registration Methods ---
  async registerStudent(studentData: any): Promise<ApiResponse<any>> {
    return this.request('/students/register', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async getStudentByUserId(userId: string): Promise<ApiResponse<any>> {
    return this.request(`/students/user/${userId}`);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
