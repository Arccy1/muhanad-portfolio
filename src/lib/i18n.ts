// Lightweight bilingual UI (EN / AR). DB content stays in the language it
// was authored in — this covers the interface chrome. Arabic enables RTL.
export type Lang = "en" | "ar";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ar", label: "عربي" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.home": "Home",
  "nav.portfolio": "Portfolio",
  "nav.about": "About",
  "nav.services": "Services",
  "nav.showreel": "Showreel",
  "nav.blog": "Blog",
  "nav.contact": "Contact",
  "nav.cv": "CV",
  "nav.hire": "Hire Me",
  "nav.subtitle": "Video Editor",
  "footer.navigate": "Navigate",
  "footer.connect": "Connect",
  "footer.rights": "All rights reserved.",
  "footer.edited": "Edited, graded & delivered with",
  "footer.by": "by Muhanad",
  "contact.name": "Name",
  "contact.email": "Email",
  "contact.type": "Project Type",
  "contact.typePlaceholder": "Select a project type",
  "contact.budget": "Budget",
  "contact.budgetPlaceholder": "Select your budget",
  "contact.message": "Message",
  "contact.messagePlaceholder": "Tell me about your project — footage, deadlines, references, anything helps.",
  "contact.send": "Send Message",
  "contact.sending": "Sending...",
  "contact.success": "MESSAGE SENT",
  "contact.successText": "Thanks for reaching out — your message landed in my inbox. I usually reply within 24 hours.",
  "contact.again": "Send another message",
  "portfolio.all": "All Work",
  "portfolio.search": "Search projects…",
  "portfolio.empty": "NO PROJECTS FOUND",
  "portfolio.emptyHint": "Try a different search or category.",
  "wizard.start": "Start a project →",
};

const ar: Dict = {
  "nav.home": "الرئيسية",
  "nav.portfolio": "أعمالي",
  "nav.about": "من أنا",
  "nav.services": "خدماتي",
  "nav.showreel": "شوريل",
  "nav.blog": "المدونة",
  "nav.contact": "تواصل",
  "nav.cv": "السيرة الذاتية",
  "nav.hire": "وظّفني",
  "nav.subtitle": "مونتير فيديو",
  "footer.navigate": "تصفح",
  "footer.connect": "تواصل",
  "footer.rights": "جميع الحقوق محفوظة.",
  "footer.edited": "مونتاج وتدريج وإخراج بـ",
  "footer.by": "مهند",
  "contact.name": "الاسم",
  "contact.email": "البريد الإلكتروني",
  "contact.type": "نوع المشروع",
  "contact.typePlaceholder": "اختر نوع المشروع",
  "contact.budget": "الميزانية",
  "contact.budgetPlaceholder": "اختر ميزانيتك",
  "contact.message": "رسالتك",
  "contact.messagePlaceholder": "حدثني عن مشروعك — الفيديوهات، المواعيد، المراجع، أي شيء يفيد.",
  "contact.send": "إرسال الرسالة",
  "contact.sending": "جارٍ الإرسال...",
  "contact.success": "تم الإرسال",
  "contact.successText": "شكرًا لتواصلك — وصلت رسالتك إلى بريدي وأرد عادة خلال ٢٤ ساعة.",
  "contact.again": "إرسال رسالة أخرى",
  "portfolio.all": "كل الأعمال",
  "portfolio.search": "ابحث في المشاريع…",
  "portfolio.empty": "لا توجد مشاريع",
  "portfolio.emptyHint": "جرّب بحثًا أو تصنيفًا مختلفًا.",
  "wizard.start": "ابدأ مشروعًا ←",
};

export const DICTS: Record<Lang, Dict> = { en, ar };

export function translate(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? DICTS.en[key] ?? key;
}
