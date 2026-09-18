import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/constants';
import { formatImageUrl } from '../utils/helpers';

const BusinessContext = createContext(null);

const DEFAULT_BUSINESS = {
  name: 'Thakre Printing Press',
  owner: 'Sachin Thakre',
  description: {
    en: 'Professional printing, designing & document services in Goregaon',
    mr: 'गोरेगावमधील व्यावसायिक प्रिंटिंग, डिझायनिंग आणि दस्तऐवज सेवा',
    hi: 'गोरेगांव में पेशेवर प्रिंटिंग, डिज़ाइनिंग और दस्तावेज़ सेवाएं',
  },
  phone: '9923113085',
  whatsapp: '9923113085',
  email: '',
  address: {
    line1: 'Beside Jamya Timya Zilla Parishad School',
    line2: 'Goregaon Main Road, Gondia–Kohmara Road',
    city: 'Goregaon',
    district: 'Gondia',
    state: 'Maharashtra',
    country: 'India',
    pin: '',
  },
  location: {
    lat: 21.2437,
    lng: 80.2084,
    googleMapsUrl: '',
  },
  branding: {
    logo: '',
    logoDark: '',
    logoLight: '',
    favicon: '',
    socialImage: '',
  },
  socialLinks: {},
  familyBusiness: true,
  establishedYear: null,
};

const DEFAULT_HOURS = {
  monday:    { open: '09:00', close: '20:00', closed: false },
  tuesday:   { open: '09:00', close: '20:00', closed: false },
  wednesday: { open: '09:00', close: '20:00', closed: false },
  thursday:  { open: '09:00', close: '20:00', closed: false },
  friday:    { open: '09:00', close: '20:00', closed: false },
  saturday:  { open: '09:00', close: '20:00', closed: false },
  sunday:    { open: '',      close: '',      closed: true },
};

export function BusinessProvider({ children }) {
  const [business, setBusiness] = useState(DEFAULT_BUSINESS);
  const [openingHours, setOpeningHours] = useState(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubBusiness = onSnapshot(
      doc(db, COLLECTIONS.BUSINESS, 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          setBusiness({ ...DEFAULT_BUSINESS, ...docSnap.data() });
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error loading business data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    const unsubHours = onSnapshot(
      doc(db, COLLECTIONS.BUSINESS, 'openingHours'),
      (docSnap) => {
        if (docSnap.exists()) {
          setOpeningHours({ ...DEFAULT_HOURS, ...docSnap.data() });
        }
      },
      (err) => {
        console.error('Error loading opening hours:', err);
      }
    );

    return () => {
      unsubBusiness();
      unsubHours();
    };
  }, []);

  // Dynamically update browser tab favicon if configured
  useEffect(() => {
    if (business?.branding?.favicon) {
      const formatted = formatImageUrl(business.branding.favicon);
      if (formatted) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = formatted;
      }
    }
  }, [business?.branding?.favicon]);

  const getLocalizedField = (field, lang = 'en') => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field.en || '';
  };

  const value = {
    business,
    openingHours,
    loading,
    error,
    getLocalizedField,
  };

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}

export default BusinessContext;
