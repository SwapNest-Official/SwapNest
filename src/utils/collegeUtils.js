// College name utilities for fuzzy matching and filtering

// Common college name variations and abbreviations
const collegeNameMap = {
  // IIIT variations
  'IIIT Allahabad': ['Indian Institute of Information Technology Allahabad', 'IIIT-A', 'IIIT A', 'IIITAllahabad'],
  'IIIT Hyderabad': ['Indian Institute of Information Technology Hyderabad', 'IIIT-H', 'IIIT H', 'IIITHyderabad'],
  'IIIT Bangalore': ['Indian Institute of Information Technology Bangalore', 'IIIT-B', 'IIIT B', 'IIITBangalore'],
  'IIIT Delhi': ['Indian Institute of Information Technology Delhi', 'IIIT-D', 'IIIT D', 'IIITDelhi'],
  'IIIT Guwahati': ['Indian Institute of Information Technology Guwahati', 'IIIT-G', 'IIIT G', 'IIITGuwahati'],
  'IIIT Jabalpur': ['Indian Institute of Information Technology Jabalpur', 'IIIT-J', 'IIIT J', 'IIITJabalpur'],
  'IIIT Kottayam': ['Indian Institute of Information Technology Kottayam', 'IIIT-K', 'IIIT K', 'IIITKottayam'],
  'IIIT Lucknow': ['Indian Institute of Information Technology Lucknow', 'IIIT-L', 'IIIT L', 'IIITLucknow'],
  'IIIT Pune': ['Indian Institute of Information Technology Pune', 'IIIT-P', 'IIIT P', 'IIITPune'],
  'IIIT Ranchi': ['Indian Institute of Information Technology Ranchi', 'IIIT-R', 'IIIT R', 'IIITRanchi'],
  'IIIT Surat': ['Indian Institute of Information Technology Surat', 'IIIT-S', 'IIIT S', 'IIITSurat'],
  'IIIT Vadodara': ['Indian Institute of Information Technology Vadodara', 'IIIT-V', 'IIIT V', 'IIITVadodara'],
  
  // IIT variations
  'IIT Bombay': ['Indian Institute of Technology Bombay', 'IIT-B', 'IIT B', 'IITBombay'],
  'IIT Delhi': ['Indian Institute of Technology Delhi', 'IIT-D', 'IIT D', 'IITDelhi'],
  'IIT Madras': ['Indian Institute of Technology Madras', 'IIT-M', 'IIT M', 'IITMadras'],
  'IIT Kanpur': ['Indian Institute of Technology Kanpur', 'IIT-K', 'IIT K', 'IITKanpur'],
  'IIT Kharagpur': ['Indian Institute of Technology Kharagpur', 'IIT-KGP', 'IIT KGP', 'IITKharagpur'],
  'IIT Roorkee': ['Indian Institute of Technology Roorkee', 'IIT-R', 'IIT R', 'IITRoorkee'],
  'IIT Guwahati': ['Indian Institute of Technology Guwahati', 'IIT-G', 'IIT G', 'IITGuwahati'],
  'IIT Bhubaneswar': ['Indian Institute of Technology Bhubaneswar', 'IIT-BBS', 'IIT BBS', 'IITBhubaneswar'],
  'IIT Gandhinagar': ['Indian Institute of Technology Gandhinagar', 'IIT-GN', 'IIT GN', 'IITGandhinagar'],
  'IIT Hyderabad': ['Indian Institute of Technology Hyderabad', 'IIT-H', 'IIT H', 'IITHyderabad'],
  'IIT Jodhpur': ['Indian Institute of Technology Jodhpur', 'IIT-J', 'IIT J', 'IITJodhpur'],
  'IIT Patna': ['Indian Institute of Technology Patna', 'IIT-P', 'IIT P', 'IITPatna'],
  'IIT Ropar': ['Indian Institute of Technology Ropar', 'IIT-RPR', 'IIT RPR', 'IITRopar'],
  'IIT Indore': ['Indian Institute of Technology Indore', 'IIT-I', 'IIT I', 'IITIndore'],
  'IIT Mandi': ['Indian Institute of Technology Mandi', 'IIT-M', 'IIT M', 'IITMandi'],
  'IIT Palakkad': ['Indian Institute of Technology Palakkad', 'IIT-PKD', 'IIT PKD', 'IITPalakkad'],
  'IIT Tirupati': ['Indian Institute of Technology Tirupati', 'IIT-T', 'IIT T', 'IITTirupati'],
  'IIT Dhanbad': ['Indian Institute of Technology Dhanbad', 'IIT-D', 'IIT D', 'IITDhanbad'],
  'IIT Bhilai': ['Indian Institute of Technology Bhilai', 'IIT-B', 'IIT B', 'IITBhilai'],
  'IIT Goa': ['Indian Institute of Technology Goa', 'IIT-G', 'IIT G', 'IITGoa'],
  'IIT Jammu': ['Indian Institute of Technology Jammu', 'IIT-J', 'IIT J', 'IITJammu'],
  'IIT Dharwad': ['Indian Institute of Technology Dharwad', 'IIT-D', 'IIT D', 'IITDharwad'],
  
  // NIT variations
  'NIT Warangal': ['National Institute of Technology Warangal', 'NIT-W', 'NIT W', 'NITWarangal'],
  'NIT Trichy': ['National Institute of Technology Tiruchirappalli', 'NIT-T', 'NIT T', 'NITTrichy'],
  'NIT Surathkal': ['National Institute of Technology Karnataka Surathkal', 'NIT-S', 'NIT S', 'NITSurathkal'],
  'NIT Calicut': ['National Institute of Technology Calicut', 'NIT-C', 'NIT C', 'NITCalicut'],
  'NIT Rourkela': ['National Institute of Technology Rourkela', 'NIT-R', 'NIT R', 'NITRourkela'],
  'NIT Kurukshetra': ['National Institute of Technology Kurukshetra', 'NIT-K', 'NIT K', 'NITKurukshetra'],
  'NIT Durgapur': ['National Institute of Technology Durgapur', 'NIT-D', 'NIT D', 'NITDurgapur'],
  'NIT Silchar': ['National Institute of Technology Silchar', 'NIT-S', 'NIT S', 'NITSilchar'],
  'NIT Hamirpur': ['National Institute of Technology Hamirpur', 'NIT-H', 'NIT H', 'NITHamirpur'],
  'NIT Jalandhar': ['National Institute of Technology Jalandhar', 'NIT-J', 'NIT J', 'NITJalandhar'],
  'NIT Jaipur': ['National Institute of Technology Jaipur', 'NIT-J', 'NIT J', 'NITJaipur'],
  'NIT Nagpur': ['National Institute of Technology Nagpur', 'NIT-N', 'NIT N', 'NITNagpur'],
  'NIT Patna': ['National Institute of Technology Patna', 'NIT-P', 'NIT P', 'NITPatna'],
  'NIT Raipur': ['National Institute of Technology Raipur', 'NIT-R', 'NIT R', 'NITRaipur'],
  'NIT Srinagar': ['National Institute of Technology Srinagar', 'NIT-S', 'NIT S', 'NITSrinagar'],
  'NIT Bhopal': ['National Institute of Technology Bhopal', 'NIT-B', 'NIT B', 'NITBhopal'],
  'NIT Agartala': ['National Institute of Technology Agartala', 'NIT-A', 'NIT A', 'NITAgartala'],
  'NIT Arunachal Pradesh': ['National Institute of Technology Arunachal Pradesh', 'NIT-AP', 'NIT AP', 'NITArunachalPradesh'],
  'NIT Manipur': ['National Institute of Technology Manipur', 'NIT-M', 'NIT M', 'NITManipur'],
  'NIT Meghalaya': ['National Institute of Technology Meghalaya', 'NIT-M', 'NIT M', 'NITMeghalaya'],
  'NIT Mizoram': ['National Institute of Technology Mizoram', 'NIT-M', 'NIT M', 'NITMizoram'],
  'NIT Nagaland': ['National Institute of Technology Nagaland', 'NIT-N', 'NIT N', 'NITNagaland'],
  'NIT Puducherry': ['National Institute of Technology Puducherry', 'NIT-P', 'NIT P', 'NITPuducherry'],
  'NIT Sikkim': ['National Institute of Technology Sikkim', 'NIT-S', 'NIT S', 'NITSikkim'],
  'NIT Tripura': ['National Institute of Technology Tripura', 'NIT-T', 'NIT T', 'NITTripura'],
  'NIT Uttarakhand': ['National Institute of Technology Uttarakhand', 'NIT-U', 'NIT U', 'NITUttarakhand'],
  
  // Other major universities
  'Delhi University': ['University of Delhi', 'DU', 'Delhi Univ'],
  'Mumbai University': ['University of Mumbai', 'MU', 'Mumbai Univ'],
  'Calcutta University': ['University of Calcutta', 'CU', 'Calcutta Univ'],
  'Chennai University': ['University of Madras', 'UM', 'Chennai Univ'],
  'Pune University': ['Savitribai Phule Pune University', 'SPPU', 'Pune Univ'],
  'Bangalore University': ['BU', 'Bangalore Univ'],
  'Hyderabad University': ['University of Hyderabad', 'UoH', 'Hyderabad Univ'],
  'BHU': ['Banaras Hindu University', 'Banaras Hindu Univ'],
  'JNU': ['Jawaharlal Nehru University', 'Jawaharlal Nehru Univ'],
  'JMI': ['Jamia Millia Islamia', 'Jamia Millia Islamia University'],
  'AMU': ['Aligarh Muslim University', 'Aligarh Muslim Univ'],
  'DU': ['Delhi University', 'University of Delhi', 'Delhi Univ'],
  'MU': ['Mumbai University', 'University of Mumbai', 'Mumbai Univ'],
  'CU': ['Calcutta University', 'University of Calcutta', 'Calcutta Univ'],
  'UM': ['Chennai University', 'University of Madras', 'Chennai Univ'],
  'SPPU': ['Pune University', 'Savitribai Phule Pune University', 'Pune Univ'],
  'BU': ['Bangalore University', 'Bangalore Univ'],
  'UoH': ['Hyderabad University', 'University of Hyderabad', 'Hyderabad Univ']
};

// Function to get all variations of a college name
export const getCollegeVariations = (collegeName) => {
  const normalizedName = collegeName.trim().toLowerCase();
  
  // Check if the input matches any key or variation
  for (const [key, variations] of Object.entries(collegeNameMap)) {
    if (key.toLowerCase() === normalizedName) {
      return [key, ...variations];
    }
    
    for (const variation of variations) {
      if (variation.toLowerCase() === normalizedName) {
        return [key, ...variations];
      }
    }
  }
  
  // If no exact match found, return the original name
  return [collegeName];
};

// Function to check if two college names are the same
export const areCollegesSame = (college1, college2) => {
  if (!college1 || !college2) return false;
  
  const variations1 = getCollegeVariations(college1);
  const variations2 = getCollegeVariations(college2);
  
  // Check if any variation matches
  for (const var1 of variations1) {
    for (const var2 of variations2) {
      if (var1.toLowerCase() === var2.toLowerCase()) {
        return true;
      }
    }
  }
  
  return false;
};

// Function to get the canonical name of a college
export const getCanonicalCollegeName = (collegeName) => {
  const normalizedName = collegeName.trim().toLowerCase();
  
  for (const [key, variations] of Object.entries(collegeNameMap)) {
    if (key.toLowerCase() === normalizedName) {
      return key;
    }
    
    for (const variation of variations) {
      if (variation.toLowerCase() === normalizedName) {
        return key;
      }
    }
  }
  
  // If no match found, return the original name
  return collegeName;
};

// Function to get college suggestions based on partial input
export const getCollegeSuggestions = (partialName, limit = 10) => {
  if (!partialName || partialName.length < 2) return [];
  
  const suggestions = [];
  const partial = partialName.toLowerCase();
  
  for (const [key, variations] of Object.entries(collegeNameMap)) {
    if (key.toLowerCase().includes(partial)) {
      suggestions.push(key);
    }
    
    for (const variation of variations) {
      if (variation.toLowerCase().includes(partial)) {
        suggestions.push(variation);
      }
    }
    
    if (suggestions.length >= limit) break;
  }
  
  return suggestions.slice(0, limit);
};

// Function to filter products by college with fuzzy matching
export const filterProductsByCollege = (products, collegeFilter) => {
  if (!collegeFilter || collegeFilter.trim() === '') {
    return products;
  }
  
  return products.filter(product => {
    if (!product.college) return false;
    return areCollegesSame(product.college, collegeFilter);
  });
};

// Function to get unique colleges from products
export const getUniqueColleges = (products) => {
  const colleges = new Set();
  
  products.forEach(product => {
    if (product.college) {
      colleges.add(getCanonicalCollegeName(product.college));
    }
  });
  
  return Array.from(colleges).sort();
};
