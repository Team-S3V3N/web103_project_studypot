// Demo campuses for the university switcher. The names are made up (mostly the
// real school's mascot + "State University") and each one uses that school's
// official brand colors (see `inspiredBy` and `source`), so viewers can tell
// which university it represents.
//
// colors.primary   – buttons and date blocks
// colors.onPrimary – text on primary
// colors.accent    – small highlights (host tag, campus swatch); never used as text on white
// colors.onAccent  – text on accent
// colors.ink       – brand color dark enough for links and text on white
// colors.surface   – light panel background (Ohio State forbids tints of its main color,
//                    so this is a separate, guide-approved light color)

export const DEFAULT_CAMPUS_ID = 'studypot'

export const CAMPUSES = [
  {
    id: 'studypot',
    isDefault: true,
    name: 'StudyPot',
    shortName: 'StudyPot',
    location: 'Default theme',
    colors: {
      primary: '#2b2724',
      onPrimary: '#ffffff',
      accent: '#d9733f',
      onAccent: '#1f1a17',
      ink: '#a3461f',
      surface: '#f6f1ea',
    },
  },
  {
    id: 'ohio-state',
    name: 'Buckeye State University',
    shortName: 'Buckeye State',
    inspiredBy: 'The Ohio State University (Buckeyes mascot; Ohio is also nicknamed the Buckeye State)',
    location: 'Columbus, OH',
    source: 'https://bux.osu.edu/color/primary-colors',
    colors: {
      primary: '#ba0c2f', // Scarlet
      onPrimary: '#ffffff',
      accent: '#a7b1b7', // Gray
      onAccent: '#212325',
      ink: '#ba0c2f',
      surface: '#eff1f2', // Gray Light 80
    },
  },
  {
    id: 'arizona-state',
    name: 'Sun Devil State University',
    shortName: 'Sun Devil State',
    inspiredBy: 'Arizona State University (Sun Devils mascot)',
    location: 'Tempe, AZ',
    source: 'https://brandguide.asu.edu/Elements-of-the-brand/Color-palette',
    colors: {
      primary: '#8c1d40', // ASU Maroon
      onPrimary: '#ffffff',
      accent: '#ffc627', // ASU Gold (never as text on white)
      onAccent: '#191919',
      ink: '#8c1d40',
      surface: '#f6eef1',
    },
  },
  {
    id: 'penn-state',
    name: 'Penrose State University',
    shortName: 'Penrose State',
    inspiredBy: 'Penn State (same PSU initials)',
    location: 'University Park, PA',
    source: 'https://brand.psu.edu/design-toolkit/design-essentials',
    colors: {
      primary: '#001e44', // Nittany Navy
      onPrimary: '#ffffff',
      accent: '#96bee6', // Pugh Blue
      onAccent: '#001e44',
      ink: '#1e407c', // Beaver Blue
      surface: '#edf3fa',
    },
  },
  {
    id: 'washington',
    name: 'Husky State University',
    shortName: 'Husky State',
    inspiredBy: 'University of Washington (Huskies mascot)',
    location: 'Seattle, WA',
    source: 'https://www.washington.edu/brand/colors/',
    colors: {
      primary: '#32006e', // Husky Purple
      onPrimary: '#ffffff',
      accent: '#b7a57a', // Husky Gold
      onAccent: '#32006e',
      ink: '#4b2e83', // Spirit Purple
      surface: '#f3f0f8',
    },
  },
]
