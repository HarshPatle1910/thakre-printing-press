import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { SEED_DATA } from '../src/config/seedData.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBSyGb2M8KBAnxbal3piSYkPZiGyHwhYQg',
  authDomain: 'thakre-printing-press.firebaseapp.com',
  projectId: 'thakre-printing-press',
  storageBucket: 'thakre-printing-press.firebasestorage.app',
  messagingSenderId: '760512353738',
  appId: '1:760512353738:web:4c9507559f47a88acceb33',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runSeed() {
  console.log('Seeding business documents...');
  await setDoc(doc(db, 'business', 'main'), SEED_DATA.business.main);
  await setDoc(doc(db, 'business', 'openingHours'), SEED_DATA.business.openingHours);

  console.log('Seeding services...');
  for (const service of SEED_DATA.services) {
    const id = service.slug || service.id;
    await setDoc(doc(db, 'services', id), service);
  }

  console.log('Seeding forms...');
  for (const form of SEED_DATA.forms) {
    const id = form.id || form.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await setDoc(doc(db, 'forms', id), form);
  }

  console.log('Seeding FAQs...');
  for (const faq of SEED_DATA.faqs) {
    const id = faq.id;
    await setDoc(doc(db, 'faqs', id), faq);
  }

  console.log('Seeding homepage CMS...');
  await setDoc(doc(db, 'pages', 'homepage'), {
    hero: {
      title: {
        en: 'High Quality Printing & Designing Services in Goregaon',
        mr: 'गोरेगावमध्ये उच्च दर्जाची प्रिंटिंग आणि डिझायनिंग सेवा',
        hi: 'गोरेगांव में उच्च गुणवत्ता वाली प्रिंटिंग और डिज़ाइनिंग सेवाएं',
      },
      subtitle: {
        en: 'From vibrant flex banners and wedding invitations to official government forms and custom merchandise.',
        mr: 'आकर्षक फ्लेक्स बॅनर आणि लग्नाची आमंत्रण पत्रिका ते अधिकृत शासकीय फॉर्म्स आणि कस्टम प्रिंट्सपर्यंत.',
        hi: 'आकर्षक फ्लेक्स बैनर और शादी के निमंत्रण पत्र से लेकर सरकारी फॉर्म और कस्टम प्रिंट्स तक।',
      },
      image: '',
      ctaLabel: { en: 'Request a Quote', mr: 'कोटेशन मागा', hi: 'कोटेशन प्राप्त करें' },
    },
    announcement: {
      enabled: false,
      text: { en: 'Special discount on bulk wedding card printing this season!', mr: '', hi: '' },
    },
    whyChooseUs: [
      {
        icon: 'printer',
        title: { en: 'State-of-the-Art Machines', mr: 'आधुनिक मशिन्स', hi: 'आधुनिक मशीनें' },
        description: { en: 'Crisp, high-definition prints with durable color accuracy.', mr: '', hi: '' },
      },
      {
        icon: 'clock',
        title: { en: 'Fast Turnaround', mr: 'जलद वितरण', hi: 'तेज़ डिलीवरी' },
        description: { en: 'Urgent banner printing and same-day document prints available.', mr: '', hi: '' },
      },
      {
        icon: 'award',
        title: { en: 'Local Family Trust', mr: 'स्थानिक विश्वास', hi: 'स्थानीय विश्वसनीयता' },
        description: { en: 'Proudly serving Goregaon and Gondia district for years.', mr: '', hi: '' },
      },
    ],
  });

  console.log('Database seeded successfully into Firestore!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
