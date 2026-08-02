// Translation key interfaces for type safety
export interface CommonTranslations {
  navigation: {
    home: string;
    tournaments: string;
    rankings: string;
    gallery: string;
    contact: string;
  };
  buttons: {
    viewDetails: string;
    register: string;
    viewAll: string;
    close: string;
    next: string;
    previous: string;
    viewRankings: string;
    upcomingTournaments: string;
    scrollToContent: string;
  };
  status: {
    upcoming: string;
    inProgress: string;
    completed: string;
    registrationOpen: string;
    registrationClosed: string;
  };
  labels: {
    level: string;
    points: string;
    rank: string;
    email: string;
    phone: string;
    date: string;
    location: string;
    club: string;
  };
  aria: {
    instagram: string;
    facebook: string;
    twitter: string;
    toggleMenu: string;
  };
}

export interface HomeTranslations {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    cta: {
      viewRankings: string;
      upcomingTournaments: string;
    };
  };
  sections: {
    upcomingTournaments: string;
    upcomingTournamentsDescription: string;
    featuredPlayers: string;
    featuredPlayersDescription: string;
    gallery: string;
    galleryDescription: string;
    sponsors: string;
    sponsorsDescription: string;
  };
}

export interface TournamentTranslations {
  labels: {
    tournamentDetails: string;
    registrationStatus: string;
    participants: string;
    results: string;
    photoGallery: string;
    winner: string;
    runnerUp: string;
    firstPlace: string;
    secondPlace: string;
  };
  status: {
    registrationOpen: string;
    registrationClosed: string;
    upcoming: string;
    inProgress: string;
    completed: string;
  };
  levels: {
    open: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
    level6: string;
  };
  messages: {
    noTournaments: string;
    loadingTournaments: string;
    registrationSuccess: string;
    registrationError: string;
  };
}

export interface RankingTranslations {
  labels: {
    playerRankings: string;
    levelCategories: string;
    playerProfile: string;
    totalPoints: string;
    currentRank: string;
    tournamentHistory: string;
    achievements: string;
    contactInfo: string;
    socialMedia: string;
    winLossRecord: string;
    bestFinishes: string;
  };
  levels: {
    open: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
    level6: string;
  };
  placementIndicators: {
    first: string;
    second: string;
    third: string;
    finalist: string;
    semifinalist: string;
  };
  messages: {
    noPlayers: string;
    loadingRankings: string;
    playerNotFound: string;
  };
}

export interface GalleryTranslations {
  labels: {
    photoGallery: string;
    tournamentPhotos: string;
    eventPhotos: string;
    filterPhotos: string;
    viewLarger: string;
    downloadPhoto: string;
    sharePhoto: string;
  };
  filters: {
    all: string;
    byTournament: string;
    byYear: string;
    byEvent: string;
    recent: string;
  };
  navigation: {
    previous: string;
    next: string;
    close: string;
    viewAll: string;
  };
  metadata: {
    tournament: string;
    date: string;
    location: string;
    photographer: string;
  };
  messages: {
    noPhotos: string;
    loadingPhotos: string;
    photoLoadError: string;
  };
}

export interface ContactTranslations {
  hero: {
    title: string;
    description: string;
  };
  labels: {
    whatsapp: string;
    email: string;
    phone: string;
  };
  card: {
    eyebrow: string;
    title: string;
    description: string;
    benefit1: string;
    benefit2: string;
    benefit3: string;
    benefit4: string;
    ctaPrimary: string;
    ctaSecondary: string;
    channelsTitle: string;
    followUsTitle: string;
  };
  banner: {
    line1: string;
    line2: string;
  };
}

export interface SEOTranslations {
  titles: {
    home: string;
    tournaments: string;
    rankings: string;
    gallery: string;
    contact: string;
    about: string;
    playerProfile: string;
    tournamentDetails: string;
  };
  descriptions: {
    home: string;
    tournaments: string;
    rankings: string;
    gallery: string;
    contact: string;
    about: string;
    playerProfile: string;
    tournamentDetails: string;
  };
  openGraph: {
    siteName: string;
    type: string;
    locale: string;
    homeTitle: string;
    homeDescription: string;
  };
  keywords: {
    home: string;
    tournaments: string;
    rankings: string;
    gallery: string;
    contact: string;
  };
}

// Main translations interface
export interface Translations {
  common: CommonTranslations;
  home: HomeTranslations;
  tournaments: TournamentTranslations;
  rankings: RankingTranslations;
  gallery: GalleryTranslations;
  contact: ContactTranslations;
  seo: SEOTranslations;
}

// Locale configuration interface
export interface LocaleConfig {
  code: string;
  name: string;
  dateFormat: Intl.DateTimeFormatOptions;
  numberFormat: Intl.NumberFormatOptions;
  currencyFormat: Intl.NumberFormatOptions;
  rtl: boolean;
}

// Translation function parameters
export interface TranslationParams {
  [key: string]: string | number;
}
