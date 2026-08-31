export interface NepalDistrict {
  name: string;
  cities: string[];
}

export interface NepalProvince {
  name: string;
  districts: NepalDistrict[];
}

export const nepalLocations: NepalProvince[] = [
  // =========================================================
  // 1. KOSHI PROVINCE
  // =========================================================
  {
    name: 'Koshi Province',
    districts: [
      {
        name: 'Bhojpur',
        cities: ['Bhojpur', 'Shadanand', 'Tyamkemaiyum'],
      },
      {
        name: 'Dhankuta',
        cities: ['Dhankuta', 'Pakhribas', 'Mahalaxmi'],
      },
      {
        name: 'Ilam',
        cities: ['Ilam', 'Deumai', 'Mai', 'Suryodaya'],
      },
      {
        name: 'Jhapa',
        cities: [
          'Bhadrapur',
          'Birtamod',
          'Damak',
          'Mechinagar',
          'Kankai',
          'Arjundhara',
          'Shivasatakshi',
          'Gauradaha',
        ],
      },
      {
        name: 'Khotang',
        cities: ['Diktel Rupakot Majhuwagadhi', 'Halesi Tuwachung'],
      },
      {
        name: 'Morang',
        cities: [
          'Biratnagar',
          'Belbari',
          'Letang',
          'Pathari Shanishchare',
          'Rangeli',
          'Ratuwamai',
          'Sunwarshi',
          'Urlabari',
          'Sundar Haraicha',
        ],
      },
      {
        name: 'Okhaldhunga',
        cities: ['Siddhicharan', 'Manebhanjyang'],
      },
      {
        name: 'Panchthar',
        cities: ['Phidim', 'Hilihang'],
      },
      {
        name: 'Sankhuwasabha',
        cities: ['Khandbari', 'Chainpur', 'Madi', 'Dharmadevi'],
      },
      {
        name: 'Solukhumbu',
        cities: ['Solududhkunda', 'Namche', 'Salleri'],
      },
      {
        name: 'Sunsari',
        cities: [
          'Itahari',
          'Dharan',
          'Inaruwa',
          'Duhabi',
          'Ramdhuni',
          'Barahachhetra',
        ],
      },
      {
        name: 'Taplejung',
        cities: ['Phungling', 'Pathibhara'],
      },
      {
        name: 'Terhathum',
        cities: ['Myanglung', 'Laligurans'],
      },
      {
        name: 'Udayapur',
        cities: [
          'Triyuga',
          'Katari',
          'Chaudandigadhi',
          'Belaka',
        ],
      },
    ],
  },

  // =========================================================
  // 2. MADHESH PROVINCE
  // =========================================================
  {
    name: 'Madhesh Province',
    districts: [
      {
        name: 'Bara',
        cities: [
          'Kalaiya',
          'Jitpur Simara',
          'Kolhabi',
          'Mahagadhimai',
          'Nijgadh',
          'Simraungadh',
        ],
      },
      {
        name: 'Dhanusha',
        cities: [
          'Janakpurdham',
          'Chhireshwarnath',
          'Dhanushadham',
          'Mithila',
          'Ganeshman Charnath',
        ],
      },
      {
        name: 'Mahottari',
        cities: [
          'Jaleshwar',
          'Bardibas',
          'Gaushala',
          'Loharpatti',
          'Ramgopalpur',
        ],
      },
      {
        name: 'Parsa',
        cities: ['Birgunj', 'Pokhariya', 'Bahudarmai', 'Parsagadhi'],
      },
      {
        name: 'Rautahat',
        cities: [
          'Gaur',
          'Chandrapur',
          'Garuda',
          'Katahariya',
          'Rajpur',
          'Brindaban',
        ],
      },
      {
        name: 'Saptari',
        cities: [
          'Rajbiraj',
          'Kanchanrup',
          'Dakneshwori',
          'Hanumannagar Kankalini',
          'Khadak',
          'Shambhunath',
        ],
      },
      {
        name: 'Sarlahi',
        cities: [
          'Malangwa',
          'Lalbandi',
          'Harion',
          'Barahathwa',
          'Bagmati',
          'Ishwarpur',
        ],
      },
      {
        name: 'Siraha',
        cities: [
          'Siraha',
          'Lahan',
          'Golbazar',
          'Mirchaiya',
          'Dhangadhimai',
          'Kalyanpur',
        ],
      },
    ],
  },

  // =========================================================
  // 3. BAGMATI PROVINCE
  // =========================================================
  {
    name: 'Bagmati Province',
    districts: [
      {
        name: 'Bhaktapur',
        cities: [
          'Bhaktapur',
          'Madhyapur Thimi',
          'Suryabinayak',
          'Changunarayan',
        ],
      },
      {
        name: 'Chitwan',
        cities: [
          'Bharatpur',
          'Ratnanagar',
          'Khairahani',
          'Madi',
          'Kalika',
          'Rapti',
        ],
      },
      {
        name: 'Dhading',
        cities: ['Nilkantha', 'Dhunibesi', 'Gajuri', 'Galchi'],
      },
      {
        name: 'Dolakha',
        cities: ['Bhimeshwar', 'Jiri', 'Charikot'],
      },
      {
        name: 'Kathmandu',
        cities: [
          'Kathmandu Metropolitan City',
          'Kirtipur',
          'Tokha',
          'Budhanilkantha',
          'Gokarneshwar',
          'Kageshwori Manohara',
          'Shankharapur',
          'Tarakeshwar',
          'Nagarjun',
          'Chandragiri',
          'Dakshinkali',
        ],
      },
      {
        name: 'Kavrepalanchok',
        cities: [
          'Dhulikhel',
          'Banepa',
          'Panauti',
          'Panchkhal',
          'Namobuddha',
          'Mandandeupur',
        ],
      },
      {
        name: 'Lalitpur',
        cities: [
          'Lalitpur Metropolitan City',
          'Godawari',
          'Mahalaxmi',
          'Konjyosom',
          'Bagmati',
          'Mahankal',
        ],
      },
      {
        name: 'Makwanpur',
        cities: ['Hetauda', 'Thaha', 'Manahari'],
      },
      {
        name: 'Nuwakot',
        cities: ['Bidur', 'Belkotgadhi', 'Kakani'],
      },
      {
        name: 'Ramechhap',
        cities: ['Manthali', 'Ramechhap'],
      },
      {
        name: 'Rasuwa',
        cities: ['Dhunche', 'Syabrubesi', 'Gosaikunda'],
      },
      {
        name: 'Sindhuli',
        cities: ['Kamalamai', 'Dudhouli', 'Marin'],
      },
      {
        name: 'Sindhupalchok',
        cities: [
          'Chautara Sangachowkgadhi',
          'Barhabise',
          'Melamchi',
        ],
      },
    ],
  },

  // =========================================================
  // 4. GANDAKI PROVINCE
  // =========================================================
  {
    name: 'Gandaki Province',
    districts: [
      {
        name: 'Baglung',
        cities: ['Baglung', 'Galkot', 'Jaimini', 'Dhorpatan'],
      },
      {
        name: 'Gorkha',
        cities: ['Gorkha', 'Palungtar', 'Barpak'],
      },
      {
        name: 'Kaski',
        cities: [
          'Pokhara Metropolitan City',
          'Annapurna',
          'Machhapuchchhre',
          'Madi',
          'Rupa',
        ],
      },
      {
        name: 'Lamjung',
        cities: ['Besisahar', 'Sundarbazar', 'Rainas', 'Madhya Nepal'],
      },
      {
        name: 'Manang',
        cities: ['Chame', 'Manang', 'Narpa Bhumi'],
      },
      {
        name: 'Mustang',
        cities: ['Jomsom', 'Gharapjhong', 'Lo Manthang', 'Marpha'],
      },
      {
        name: 'Myagdi',
        cities: ['Beni', 'Mangala', 'Raghuganga'],
      },
      {
        name: 'Nawalpur',
        cities: [
          'Kawasoti',
          'Gaindakot',
          'Devchuli',
          'Madhyabindu',
        ],
      },
      {
        name: 'Parbat',
        cities: ['Kushma', 'Phalebas'],
      },
      {
        name: 'Syangja',
        cities: [
          'Putalibazar',
          'Waling',
          'Galyang',
          'Chapakot',
          'Bhirkot',
        ],
      },
      {
        name: 'Tanahun',
        cities: [
          'Byas',
          'Shuklagandaki',
          'Bhanu',
          'Bhimad',
          'Bandipur',
        ],
      },
    ],
  },

  // =========================================================
  // 5. LUMBINI PROVINCE
  // =========================================================
  {
    name: 'Lumbini Province',
    districts: [
      {
        name: 'Arghakhanchi',
        cities: ['Sandhikharka', 'Sitganga', 'Bhumikasthan'],
      },
      {
        name: 'Banke',
        cities: ['Nepalgunj', 'Kohalpur', 'Khajura'],
      },
      {
        name: 'Bardiya',
        cities: ['Gulariya', 'Rajapur', 'Madhuwan', 'Thakurbaba'],
      },
      {
        name: 'Dang',
        cities: [
          'Ghorahi',
          'Tulsipur',
          'Lamahi',
          'Rapti',
        ],
      },
      {
        name: 'Gulmi',
        cities: ['Resunga', 'Musikot', 'Tamghas'],
      },
      {
        name: 'Kapilvastu',
        cities: [
          'Kapilvastu',
          'Banganga',
          'Buddhabhumi',
          'Shivaraj',
          'Krishnanagar',
        ],
      },
      {
        name: 'Parasi',
        cities: [
          'Ramgram',
          'Sunwal',
          'Bardaghat',
          'Pratappur',
        ],
      },
      {
        name: 'Palpa',
        cities: ['Tansen', 'Rampur'],
      },
      {
        name: 'Pyuthan',
        cities: ['Pyuthan', 'Swargadwari'],
      },
      {
        name: 'Rolpa',
        cities: ['Rolpa', 'Liwang', 'Runtigadhi'],
      },
      {
        name: 'Rukum East',
        cities: ['Rukumkot', 'Sisne', 'Bhume', 'Putha Uttarganga'],
      },
      {
        name: 'Rupandehi',
        cities: [
          'Butwal',
          'Siddharthanagar',
          'Tilottama',
          'Devdaha',
          'Lumbini Sanskritik',
          'Sainamaina',
        ],
      },
    ],
  },

  // =========================================================
  // 6. KARNALI PROVINCE
  // =========================================================
  {
    name: 'Karnali Province',
    districts: [
      {
        name: 'Dailekh',
        cities: ['Narayan', 'Dullu', 'Chamunda Bindrasaini'],
      },
      {
        name: 'Dolpa',
        cities: ['Dunai', 'Thuli Bheri', 'Tripurasundari'],
      },
      {
        name: 'Humla',
        cities: ['Simikot', 'Namkha'],
      },
      {
        name: 'Jajarkot',
        cities: ['Bheri', 'Chhedagad', 'Nalgad', 'Khalanga'],
      },
      {
        name: 'Jumla',
        cities: ['Chandannath', 'Khalanga', 'Tatopani'],
      },
      {
        name: 'Kalikot',
        cities: ['Khandachakra', 'Raskot', 'Tilagupha'],
      },
      {
        name: 'Mugu',
        cities: ['Chhayanath Rara', 'Gamgadhi'],
      },
      {
        name: 'Rukum West',
        cities: ['Musikot', 'Chaurjahari', 'Aathbiskot'],
      },
      {
        name: 'Salyan',
        cities: ['Sharada', 'Bagchaur', 'Bangad Kupinde'],
      },
      {
        name: 'Surkhet',
        cities: [
          'Birendranagar',
          'Bheriganga',
          'Gurbhakot',
          'Panchapuri',
          'Lekbeshi',
        ],
      },
    ],
  },

  // =========================================================
  // 7. SUDURPASHCHIM PROVINCE
  // =========================================================
  {
    name: 'Sudurpashchim Province',
    districts: [
      {
        name: 'Achham',
        cities: [
          'Mangalsen',
          'Sanphebagar',
          'Kamalbazar',
          'Panchadewal Binayak',
        ],
      },
      {
        name: 'Baitadi',
        cities: ['Dasharathchand', 'Patan', 'Melauli', 'Purchaudi'],
      },
      {
        name: 'Bajhang',
        cities: ['Jayaprithvi', 'Bungal', 'Chainpur'],
      },
      {
        name: 'Bajura',
        cities: ['Badimalika', 'Budhinanda', 'Tribeni'],
      },
      {
        name: 'Dadeldhura',
        cities: ['Amargadhi', 'Parshuram'],
      },
      {
        name: 'Darchula',
        cities: ['Mahakali', 'Shailyashikhar', 'Khalanga'],
      },
      {
        name: 'Doti',
        cities: ['Dipayal Silgadhi', 'Shikhar'],
      },
      {
        name: 'Kailali',
        cities: [
          'Dhangadhi',
          'Tikapur',
          'Ghodaghodi',
          'Lamkichuha',
          'Bhajani',
          'Godawari',
          'Gauriganga',
        ],
      },
      {
        name: 'Kanchanpur',
        cities: [
          'Bhimdatta',
          'Punarbas',
          'Bedkot',
          'Mahakali',
          'Shuklaphanta',
          'Krishnapur',
          'Belauri',
        ],
      },
    ],
  },
];

// ---------------------------------------------------------
// Helper functions for dependent dropdowns
// ---------------------------------------------------------

export const getProvinces = (): string[] => {
  return nepalLocations.map((province) => province.name);
};

export const getDistricts = (provinceName: string): string[] => {
  const province = nepalLocations.find(
    (item) => item.name === provinceName
  );

  return province
    ? province.districts.map((district) => district.name)
    : [];
};

export const getCities = (
  provinceName: string,
  districtName: string
): string[] => {
  const province = nepalLocations.find(
    (item) => item.name === provinceName
  );

  if (!province) {
    return [];
  }

  const district = province.districts.find(
    (item) => item.name === districtName
  );

  return district?.cities ?? [];
};

export default nepalLocations;