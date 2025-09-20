// Institution data constants and utility functions

export const INSTITUTE_TYPES = [
  "School",
  "College",
  "University",
  "Sports Academy",
  "Sports Club",
  "Other"
];

// Institution data by type
export const INSTITUTION_DATA = {
  "School": [
    "Delhi Public School",
    "Kendriya Vidyalaya",
    "Army Public School",
    "DPS International",
    "The Doon School",
    "Mayo College",
    "St. Stephen's School",
    "Modern School",
    "Vasant Valley School",
    "Springdales School",
    "Apeejay School",
    "Ryan International School",
    "DAV Public School",
    "Bharatiya Vidya Bhavan",
    "Sanskriti School",
    "The Shri Ram School",
    "Amity International School",
    "GD Goenka School",
    "Heritage School",
    "Lotus Valley School"
  ],
  "College": [
    "St. Stephen's College",
    "Hindu College",
    "Lady Shri Ram College",
    "Miranda House",
    "Hansraj College",
    "Ramjas College",
    "Kirori Mal College",
    "Gargi College",
    "Jesus and Mary College",
    "Kamala Nehru College",
    "Sri Venkateswara College",
    "Acharya Narendra Dev College",
    "Deen Dayal Upadhyaya College",
    "Keshav Mahavidyalaya",
    "Maitreyi College",
    "Motilal Nehru College",
    "Rajdhani College",
    "Shyam Lal College",
    "Swami Shraddhanand College",
    "Vivekananda College"
  ],
  "University": [
    "University of Delhi",
    "Jawaharlal Nehru University",
    "Jamia Millia Islamia",
    "Ambedkar University Delhi",
    "Guru Gobind Singh Indraprastha University",
    "Netaji Subhas University of Technology",
    "Delhi Technological University",
    "Indraprastha Institute of Information Technology",
    "National Institute of Technology Delhi",
    "Indian Institute of Technology Delhi",
    "All India Institute of Medical Sciences",
    "Jamia Hamdard University",
    "Shiv Nadar University",
    "Ashoka University",
    "OP Jindal Global University",
    "Amity University",
    "Galgotias University",
    "Bennett University",
    "Manav Rachna University",
    "SRM University"
  ],
  "Sports Academy": [
    "Sports Authority of India",
    "National Institute of Sports",
    "Patiala Sports Academy",
    "Bangalore Sports Academy",
    "Mumbai Sports Academy",
    "Chennai Sports Academy",
    "Kolkata Sports Academy",
    "Delhi Sports Academy",
    "Pune Sports Academy",
    "Hyderabad Sports Academy",
    "Ahmedabad Sports Academy",
    "Chandigarh Sports Academy",
    "Bhopal Sports Academy",
    "Jaipur Sports Academy",
    "Lucknow Sports Academy",
    "Bhubaneswar Sports Academy",
    "Guwahati Sports Academy",
    "Kochi Sports Academy",
    "Indore Sports Academy",
    "Vadodara Sports Academy"
  ],
  "Sports Club": [
    "Delhi Sports Club",
    "Mumbai Sports Club",
    "Bangalore Sports Club",
    "Chennai Sports Club",
    "Kolkata Sports Club",
    "Pune Sports Club",
    "Hyderabad Sports Club",
    "Ahmedabad Sports Club",
    "Chandigarh Sports Club",
    "Bhopal Sports Club",
    "Jaipur Sports Club",
    "Lucknow Sports Club",
    "Bhubaneswar Sports Club",
    "Guwahati Sports Club",
    "Kochi Sports Club",
    "Indore Sports Club",
    "Vadodara Sports Club",
    "Surat Sports Club",
    "Nashik Sports Club",
    "Vijayawada Sports Club"
  ],
  "Other": []
};

// Utility function to get institution options based on type
export function getInstituteOptions(instituteType: string): string[] {
  if (instituteType === "Other") {
    return []; // Return empty array for "Other" type
  }
  
  return INSTITUTION_DATA[instituteType as keyof typeof INSTITUTION_DATA] || [];
}


