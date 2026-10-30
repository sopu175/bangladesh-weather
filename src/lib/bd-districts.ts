// All 64 districts of Bangladesh with division info, Bangla names and coordinates.
// Coordinates point to the district headquarters (approximate).

export type Division =
  | 'Dhaka'
  | 'Chattogram'
  | 'Rajshahi'
  | 'Khulna'
  | 'Barishal'
  | 'Sylhet'
  | 'Rangpur'
  | 'Mymensingh';

export interface BDDistrict {
  id: string;
  name: string;
  bnName: string;
  division: Division;
  lat: number;
  lon: number;
}

export const DIVISIONS: { name: Division; bnName: string }[] = [
  { name: 'Dhaka', bnName: 'ঢাকা' },
  { name: 'Chattogram', bnName: 'চট্টগ্রাম' },
  { name: 'Rajshahi', bnName: 'রাজশাহী' },
  { name: 'Khulna', bnName: 'খুলনা' },
  { name: 'Barishal', bnName: 'বরিশাল' },
  { name: 'Sylhet', bnName: 'সিলেট' },
  { name: 'Rangpur', bnName: 'রংপুর' },
  { name: 'Mymensingh', bnName: 'ময়মনসিংহ' },
];

export const BD_DISTRICTS: BDDistrict[] = [
  // ---------------- Dhaka Division (13) ----------------
  { id: 'dhaka', name: 'Dhaka', bnName: 'ঢাকা', division: 'Dhaka', lat: 23.8103, lon: 90.4125 },
  { id: 'faridpur', name: 'Faridpur', bnName: 'ফরিদপুর', division: 'Dhaka', lat: 23.607, lon: 89.8429 },
  { id: 'gazipur', name: 'Gazipur', bnName: 'গাজীপুর', division: 'Dhaka', lat: 24.0023, lon: 90.426 },
  { id: 'gopalganj', name: 'Gopalganj', bnName: 'গোপালগঞ্জ', division: 'Dhaka', lat: 23.005, lon: 89.8266 },
  { id: 'kishoreganj', name: 'Kishoreganj', bnName: 'কিশোরগঞ্জ', division: 'Dhaka', lat: 24.4449, lon: 90.7766 },
  { id: 'madaripur', name: 'Madaripur', bnName: 'মাদারীপুর', division: 'Dhaka', lat: 23.1641, lon: 90.1897 },
  { id: 'manikganj', name: 'Manikganj', bnName: 'মানিকগঞ্জ', division: 'Dhaka', lat: 23.8617, lon: 90.0006 },
  { id: 'munshiganj', name: 'Munshiganj', bnName: 'মুন্সিগঞ্জ', division: 'Dhaka', lat: 23.5422, lon: 90.5305 },
  { id: 'narayanganj', name: 'Narayanganj', bnName: 'নারায়ণগঞ্জ', division: 'Dhaka', lat: 23.6238, lon: 90.499 },
  { id: 'narsingdi', name: 'Narsingdi', bnName: 'নরসিংদী', division: 'Dhaka', lat: 23.9322, lon: 90.7151 },
  { id: 'rajbari', name: 'Rajbari', bnName: 'রাজবাড়ী', division: 'Dhaka', lat: 23.7574, lon: 89.6444 },
  { id: 'shariatpur', name: 'Shariatpur', bnName: 'শরীয়তপুর', division: 'Dhaka', lat: 23.2423, lon: 90.4348 },
  { id: 'tangail', name: 'Tangail', bnName: 'টাঙ্গাইল', division: 'Dhaka', lat: 24.2513, lon: 89.9167 },

  // ---------------- Chattogram Division (11) ----------------
  { id: 'bandarban', name: 'Bandarban', bnName: 'বান্দরবান', division: 'Chattogram', lat: 22.1953, lon: 92.2184 },
  { id: 'brahmanbaria', name: 'Brahmanbaria', bnName: 'ব্রাহ্মণবাড়িয়া', division: 'Chattogram', lat: 23.9571, lon: 91.1124 },
  { id: 'chandpur', name: 'Chandpur', bnName: 'চাঁদপুর', division: 'Chattogram', lat: 23.2333, lon: 90.6712 },
  { id: 'chattogram', name: 'Chattogram', bnName: 'চট্টগ্রাম', division: 'Chattogram', lat: 22.3569, lon: 91.7832 },
  { id: 'cumilla', name: 'Cumilla', bnName: 'কুমিল্লা', division: 'Chattogram', lat: 23.4607, lon: 91.1809 },
  { id: 'coxsbazar', name: "Cox's Bazar", bnName: 'কক্সবাজার', division: 'Chattogram', lat: 21.4272, lon: 92.0058 },
  { id: 'feni', name: 'Feni', bnName: 'ফেনী', division: 'Chattogram', lat: 23.0159, lon: 91.3976 },
  { id: 'khagrachhari', name: 'Khagrachhari', bnName: 'খাগড়াছড়ি', division: 'Chattogram', lat: 23.1193, lon: 91.9847 },
  { id: 'lakshmipur', name: 'Lakshmipur', bnName: 'লক্ষ্মীপুর', division: 'Chattogram', lat: 22.9447, lon: 90.8282 },
  { id: 'noakhali', name: 'Noakhali', bnName: 'নোয়াখালী', division: 'Chattogram', lat: 22.8696, lon: 91.0995 },
  { id: 'rangamati', name: 'Rangamati', bnName: 'রাঙ্গামাটি', division: 'Chattogram', lat: 22.6533, lon: 92.1735 },

  // ---------------- Rajshahi Division (8) ----------------
  { id: 'bogura', name: 'Bogura', bnName: 'বগুড়া', division: 'Rajshahi', lat: 24.8465, lon: 89.3773 },
  { id: 'chapainawabganj', name: 'Chapainawabganj', bnName: 'চাঁপাইনবাবগঞ্জ', division: 'Rajshahi', lat: 24.5965, lon: 88.2775 },
  { id: 'joypurhat', name: 'Joypurhat', bnName: 'জয়পুরহাট', division: 'Rajshahi', lat: 25.0947, lon: 89.0227 },
  { id: 'naogaon', name: 'Naogaon', bnName: 'নওগাঁ', division: 'Rajshahi', lat: 24.7936, lon: 88.9318 },
  { id: 'natore', name: 'Natore', bnName: 'নাটোর', division: 'Rajshahi', lat: 24.4206, lon: 89.0003 },
  { id: 'pabna', name: 'Pabna', bnName: 'পাবনা', division: 'Rajshahi', lat: 24.0064, lon: 89.2372 },
  { id: 'rajshahi', name: 'Rajshahi', bnName: 'রাজশাহী', division: 'Rajshahi', lat: 24.3745, lon: 88.6042 },
  { id: 'sirajganj', name: 'Sirajganj', bnName: 'সিরাজগঞ্জ', division: 'Rajshahi', lat: 24.4534, lon: 89.7007 },

  // ---------------- Khulna Division (10) ----------------
  { id: 'bagerhat', name: 'Bagerhat', bnName: 'বাগেরহাট', division: 'Khulna', lat: 22.6516, lon: 89.7859 },
  { id: 'chuadanga', name: 'Chuadanga', bnName: 'চুয়াডাঙ্গা', division: 'Khulna', lat: 23.6402, lon: 88.841 },
  { id: 'jashore', name: 'Jashore', bnName: 'যশোর', division: 'Khulna', lat: 23.1664, lon: 89.2081 },
  { id: 'jhenaidah', name: 'Jhenaidah', bnName: 'ঝিনাইদহ', division: 'Khulna', lat: 23.545, lon: 89.1539 },
  { id: 'khulna', name: 'Khulna', bnName: 'খুলনা', division: 'Khulna', lat: 22.8456, lon: 89.5403 },
  { id: 'kushtia', name: 'Kushtia', bnName: 'কুষ্টিয়া', division: 'Khulna', lat: 23.9013, lon: 89.1206 },
  { id: 'magura', name: 'Magura', bnName: 'মাগুরা', division: 'Khulna', lat: 23.4855, lon: 89.4198 },
  { id: 'meherpur', name: 'Meherpur', bnName: 'মেহেরপুর', division: 'Khulna', lat: 23.7622, lon: 88.6318 },
  { id: 'narail', name: 'Narail', bnName: 'নড়াইল', division: 'Khulna', lat: 23.1725, lon: 89.5127 },
  { id: 'satkhira', name: 'Satkhira', bnName: 'সাতক্ষীরা', division: 'Khulna', lat: 22.7185, lon: 89.0705 },

  // ---------------- Barishal Division (6) ----------------
  { id: 'barguna', name: 'Barguna', bnName: 'বরগুনা', division: 'Barishal', lat: 22.0953, lon: 90.1121 },
  { id: 'barishal', name: 'Barishal', bnName: 'বরিশাল', division: 'Barishal', lat: 22.701, lon: 90.3535 },
  { id: 'bhola', name: 'Bhola', bnName: 'ভোলা', division: 'Barishal', lat: 22.6859, lon: 90.6482 },
  { id: 'jhalokati', name: 'Jhalokati', bnName: 'ঝালকাঠি', division: 'Barishal', lat: 22.6406, lon: 90.1987 },
  { id: 'patuakhali', name: 'Patuakhali', bnName: 'পটুয়াখালী', division: 'Barishal', lat: 22.3596, lon: 90.3298 },
  { id: 'pirojpur', name: 'Pirojpur', bnName: 'পিরোজপুর', division: 'Barishal', lat: 22.5841, lon: 89.972 },

  // ---------------- Sylhet Division (4) ----------------
  { id: 'habiganj', name: 'Habiganj', bnName: 'হবিগঞ্জ', division: 'Sylhet', lat: 24.3745, lon: 91.4155 },
  { id: 'moulvibazar', name: 'Moulvibazar', bnName: 'মৌলভীবাজার', division: 'Sylhet', lat: 24.4829, lon: 91.7774 },
  { id: 'sunamganj', name: 'Sunamganj', bnName: 'সুনামগঞ্জ', division: 'Sylhet', lat: 25.0658, lon: 91.395 },
  { id: 'sylhet', name: 'Sylhet', bnName: 'সিলেট', division: 'Sylhet', lat: 24.8949, lon: 91.8687 },

  // ---------------- Rangpur Division (8) ----------------
  { id: 'dinajpur', name: 'Dinajpur', bnName: 'দিনাজপুর', division: 'Rangpur', lat: 25.6217, lon: 88.6354 },
  { id: 'gaibandha', name: 'Gaibandha', bnName: 'গাইবান্ধা', division: 'Rangpur', lat: 25.3288, lon: 89.5281 },
  { id: 'kurigram', name: 'Kurigram', bnName: 'কুড়িগ্রাম', division: 'Rangpur', lat: 25.8072, lon: 89.6295 },
  { id: 'lalmonirhat', name: 'Lalmonirhat', bnName: 'লালমনিরহাট', division: 'Rangpur', lat: 25.9923, lon: 89.2847 },
  { id: 'nilphamari', name: 'Nilphamari', bnName: 'নীলফামারী', division: 'Rangpur', lat: 25.9317, lon: 88.856 },
  { id: 'panchagarh', name: 'Panchagarh', bnName: 'পঞ্চগড়', division: 'Rangpur', lat: 26.3411, lon: 88.5542 },
  { id: 'rangpur', name: 'Rangpur', bnName: 'রংপুর', division: 'Rangpur', lat: 25.7439, lon: 89.2752 },
  { id: 'thakurgaon', name: 'Thakurgaon', bnName: 'ঠাকুরগাঁও', division: 'Rangpur', lat: 26.0337, lon: 88.4616 },

  // ---------------- Mymensingh Division (4) ----------------
  { id: 'jamalpur', name: 'Jamalpur', bnName: 'জামালপুর', division: 'Mymensingh', lat: 24.9375, lon: 89.9372 },
  { id: 'mymensingh', name: 'Mymensingh', bnName: 'ময়মনসিংহ', division: 'Mymensingh', lat: 24.7471, lon: 90.4203 },
  { id: 'netrokona', name: 'Netrokona', bnName: 'নেত্রকোণা', division: 'Mymensingh', lat: 24.8103, lon: 90.7279 },
  { id: 'sherpur', name: 'Sherpur', bnName: 'শেরপুর', division: 'Mymensingh', lat: 25.0205, lon: 90.0153 },
];

export const DHAKA: BDDistrict = BD_DISTRICTS[0];

/** Approximate geographic bounds of Bangladesh. */
export const BD_BOUNDS = {
  minLat: 20.5,
  maxLat: 26.75,
  minLon: 87.9,
  maxLon: 92.8,
};

/** Padded bounds used to reject GPS points that clearly fall outside Bangladesh. */
export function isInsideBangladesh(lat: number, lon: number): boolean {
  return (
    lat >= BD_BOUNDS.minLat &&
    lat <= BD_BOUNDS.maxLat &&
    lon >= BD_BOUNDS.minLon &&
    lon <= BD_BOUNDS.maxLon
  );
}

/** Great-circle distance between two points in kilometres. */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Find the closest district headquarters to a coordinate inside Bangladesh. */
export function nearestDistrict(
  lat: number,
  lon: number
): { district: BDDistrict; distanceKm: number } {
  let best = BD_DISTRICTS[0];
  let bestDist = Infinity;
  for (const d of BD_DISTRICTS) {
    const dist = haversineKm(lat, lon, d.lat, d.lon);
    if (dist < bestDist) {
      bestDist = dist;
      best = d;
    }
  }
  return { district: best, distanceKm: bestDist };
}

export function districtsByDivision(): Record<Division, BDDistrict[]> {
  const map = {} as Record<Division, BDDistrict[]>;
  for (const { name } of DIVISIONS) map[name] = [];
  for (const d of BD_DISTRICTS) map[d.division].push(d);
  return map;
}
