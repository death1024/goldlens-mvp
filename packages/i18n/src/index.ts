export type Locale = 'zh' | 'en' | 'th' | 'ar';

export const LOCALES: { code: Locale; label: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'zh', label: '中文', dir: 'ltr' },
  { code: 'en', label: 'EN', dir: 'ltr' },
  { code: 'th', label: 'ไทย', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' }
];

const dictionaries = {
  zh: {
    nav: { home: '首页', calculate: '计算', compare: '对比', quotes: '询价', portfolio: '持仓', alerts: '提醒', learn: '知识', account: '账户' },
    common: { live: '实时', demo: '演示', signIn: '登录', signOut: '退出', install: '安装' },
    home: { title: '买金之前，先看清真实成本。', subtitle: '国际金价、本地柜台价、工费、税费、回购折价，放进同一张账单。' }
  },
  en: {
    nav: { home: 'Home', calculate: 'Calculate', compare: 'Compare', quotes: 'Quotes', portfolio: 'Portfolio', alerts: 'Alerts', learn: 'Learn', account: 'Account' },
    common: { live: 'LIVE', demo: 'DEMO', signIn: 'Sign in', signOut: 'Sign out', install: 'Install' },
    home: { title: 'Know the real cost before you buy gold.', subtitle: 'Spot, local counter price, making charge, tax and buyback — one bill.' }
  },
  th: {
    nav: { home: 'หน้าแรก', calculate: 'คำนวณ', compare: 'เปรียบเทียบ', quotes: 'ขอใบเสนอราคา', portfolio: 'พอร์ต', alerts: 'แจ้งเตือน', learn: 'ความรู้', account: 'บัญชี' },
    common: { live: 'สด', demo: 'เดโม', signIn: 'เข้าสู่ระบบ', signOut: 'ออก', install: 'ติดตั้ง' },
    home: { title: 'รู้ต้นทุนจริงก่อนซื้อทอง', subtitle: 'ราคาโลก ราคาร้าน ค่ากำเหน็จ ภาษี และราคารับซื้อคืน ในบิลเดียว' }
  },
  ar: {
    nav: { home: 'الرئيسية', calculate: 'احسب', compare: 'قارن', quotes: 'عروض', portfolio: 'محفظتي', alerts: 'تنبيهات', learn: 'تعلّم', account: 'الحساب' },
    common: { live: 'مباشر', demo: 'تجريبي', signIn: 'دخول', signOut: 'خروج', install: 'تثبيت' },
    home: { title: 'اعرف التكلفة الحقيقية قبل شراء الذهب.', subtitle: 'السعر العالمي وسعر المتجر والمصنعية والضريبة وإعادة الشراء في فاتورة واحدة.' }
  }
} as const;

export function getDictionary(locale: Locale = 'zh') {
  return dictionaries[locale] ?? dictionaries.zh;
}

export function getDir(locale: Locale = 'zh'): 'ltr' | 'rtl' {
  return LOCALES.find((item) => item.code === locale)?.dir ?? 'ltr';
}
