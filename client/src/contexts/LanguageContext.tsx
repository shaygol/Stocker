import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'he';

interface Translations {
  [key: string]: {
    en: string;
    he: string;
  };
}

const translations: Translations = {
  'app.title': {
    en: 'Smart Shopping List',
    he: 'עגליסט - רשימת קניות חכמה',
  },
  'app.subtitle': {
    en: 'Create and manage your shopping lists, compare prices across stores',
    he: 'הדביקו רשימה מווטסאפ או הוסיפו פריטים ידנית',
  },
  'button.newList': {
    en: 'New List',
    he: 'רשימה חדשה',
  },
  'button.addItem': {
    en: 'Add Item',
    he: 'הוסף פריט',
  },
  'button.paste': {
    en: 'Paste Items',
    he: 'הדבק פריטים',
  },
  'button.share': {
    en: 'Share',
    he: 'שתף',
  },
  'button.history': {
    en: 'History',
    he: 'היסטוריה',
  },
  'button.delete': {
    en: 'Delete',
    he: 'מחק',
  },
  'button.compare': {
    en: 'Compare Prices',
    he: 'השווה מחירים',
  },
  'label.listName': {
    en: 'List Name',
    he: 'שם הרשימה',
  },
  'label.pasteItems': {
    en: 'Paste items here (one item per line)',
    he: 'הדביקו את הרשימה כאן (פריט בכל שורה)',
  },
  'label.itemName': {
    en: 'Item Name',
    he: 'שם הפריט',
  },
  'label.quantity': {
    en: 'Quantity',
    he: 'כמות',
  },
  'label.storeName': {
    en: 'Store Name',
    he: 'שם החנות',
  },
  'label.price': {
    en: 'Price',
    he: 'מחיר',
  },
  'message.noLists': {
    en: 'No shopping lists yet. Create your first list to get started!',
    he: 'אין רשימות קניות עדיין. צרו רשימה ראשונה כדי להתחיל!',
  },
  'message.noItems': {
    en: 'No items yet. Add your first item to get started!',
    he: 'אין פריטים עדיין. הוסיפו פריט ראשון כדי להתחיל!',
  },
  'message.listCreated': {
    en: 'Shopping list created successfully!',
    he: 'רשימת הקניות נוצרה בהצלחה!',
  },
  'message.itemAdded': {
    en: 'Item added successfully!',
    he: 'הפריט נוסף בהצלחה!',
  },
  'message.priceAdded': {
    en: 'Price added successfully!',
    he: 'המחיר נוסף בהצלחה!',
  },
  'message.listDeleted': {
    en: 'Shopping list deleted successfully!',
    he: 'רשימת הקניות נמחקה בהצלחה!',
  },
  'message.itemDeleted': {
    en: 'Item deleted successfully!',
    he: 'הפריט נמחק בהצלחה!',
  },
  'message.shareCreated': {
    en: 'Share link created! Copy the link to share with others.',
    he: 'קישור שיתוף נוצר! העתיקו את הקישור כדי לשתף עם אחרים.',
  },
  'title.myLists': {
    en: 'My Shopping Lists',
    he: 'הרשימות שלי',
  },
  'title.yourLists': {
    en: 'Your Lists',
    he: 'הרשימות שלך',
  },
  'title.shoppingItems': {
    en: 'Shopping Items',
    he: 'פריטי קניות',
  },
  'title.priceComparison': {
    en: 'Price Comparison',
    he: 'השוואת מחירים',
  },
  'title.history': {
    en: 'List History',
    he: 'היסטוריית רשימות',
  },
  'title.createList': {
    en: 'Create New Shopping List',
    he: 'צרו רשימת קניות חדשה',
  },
  'title.pasteList': {
    en: 'Paste Shopping List',
    he: 'הדביקו רשימת קניות',
  },
  'title.addPrice': {
    en: 'Add Price Information',
    he: 'הוסיפו מידע על מחיר',
  },
  'cheapest': {
    en: 'Cheapest at',
    he: 'הזול ביותר ב',
  },
  'mostExpensive': {
    en: 'Most expensive at',
    he: 'היקר ביותר ב',
  },
  'average': {
    en: 'Average price',
    he: 'מחיר ממוצע',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language | null;
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  const isRTL = language === 'he';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
