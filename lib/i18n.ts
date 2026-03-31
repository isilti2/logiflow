export type Lang = 'tr' | 'en';

export const translations = {
  tr: {
    // Navbar
    nav_home: 'Anasayfa',
    nav_about: 'Hakkımızda',
    nav_pricing: 'Fiyatlandırma',
    nav_blog: 'Blog',
    nav_docs: 'Docs',
    nav_contact: 'İletişim',
    nav_storage: 'Depolama',
    nav_login: 'Giriş Yap',
    nav_open_app: 'Uygulamayı Aç',
    nav_logout: 'Çıkış',
    nav_account: 'Hesabım',
    nav_dashboard: 'Dashboard',
    nav_optimization: 'Optimizasyon',
    nav_reporting: 'Raporlama',

    // Dashboard
    dash_title: 'Dashboard',
    dash_welcome: "Hoş Geldiniz",
    dash_total_opt: 'Toplam Optimizasyon',
    dash_active_cargo: 'Aktif Kargo',
    dash_active_areas: 'Aktif Depo Alanı',
    dash_last_activity: 'Son Aktivite',

    // Common
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
    search: 'Ara',
    close: 'Kapat',
    confirm: 'Onayla',
    loading: 'Yükleniyor…',
    back: 'Geri',
    next: 'Sonraki',
    skip: 'Atla',
    done: 'Tamamla',

    // Depolama
    depo_title: 'Yönetme & Depolama',
    depo_subtitle: 'Alanlarınızı ve kargo stoğunuzu merkezi olarak yönetin.',
    depo_add_cargo: 'Kargo Ekle',
    depo_add_area: 'Yeni Alan',
    depo_import_excel: 'Excel İçe Aktar',
    depo_total_area: 'Toplam Alan',
    depo_total_cargo: 'Toplam Kargo',
    depo_fill_rate: 'Seçili Alan Doluluk',
    depo_search: 'Kargo ara…',
    depo_all_status: 'Tüm Durumlar',
    depo_in_storage: 'Depolarda',
    depo_in_transit: 'Çıkışta',
    depo_waiting: 'Beklemede',

    // Bulk
    bulk_selected: 'seçili',
    bulk_delete: 'Seçilenleri Sil',
    bulk_status: 'Durum Değiştir',
    bulk_clear: 'Seçimi Temizle',

    // Optimizer
    opt_title: 'Kargo Optimizasyon',
    opt_run: 'Optimize Et',
    opt_reset: 'Sıfırla',
    opt_add_item: 'Kalem Ekle',
    opt_from_storage: 'Depodan Aktar',

    // Auth
    login_title: 'Giriş Yap',
    login_email: 'E-posta',
    login_password: 'Şifre',
    login_submit: 'Giriş Yap',
  },

  en: {
    // Navbar
    nav_home: 'Home',
    nav_about: 'About',
    nav_pricing: 'Pricing',
    nav_blog: 'Blog',
    nav_docs: 'Docs',
    nav_contact: 'Contact',
    nav_storage: 'Storage',
    nav_login: 'Sign In',
    nav_open_app: 'Open App',
    nav_logout: 'Sign Out',
    nav_account: 'My Account',
    nav_dashboard: 'Dashboard',
    nav_optimization: 'Optimization',
    nav_reporting: 'Reporting',

    // Dashboard
    dash_title: 'Dashboard',
    dash_welcome: 'Welcome',
    dash_total_opt: 'Total Optimizations',
    dash_active_cargo: 'Active Cargo',
    dash_active_areas: 'Active Storage Areas',
    dash_last_activity: 'Last Activity',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading…',
    back: 'Back',
    next: 'Next',
    skip: 'Skip',
    done: 'Done',

    // Depolama
    depo_title: 'Storage Management',
    depo_subtitle: 'Centrally manage your storage areas and cargo inventory.',
    depo_add_cargo: 'Add Cargo',
    depo_add_area: 'New Area',
    depo_import_excel: 'Import Excel',
    depo_total_area: 'Total Areas',
    depo_total_cargo: 'Total Cargo',
    depo_fill_rate: 'Selected Area Fill',
    depo_search: 'Search cargo…',
    depo_all_status: 'All Statuses',
    depo_in_storage: 'In Storage',
    depo_in_transit: 'In Transit',
    depo_waiting: 'Waiting',

    // Bulk
    bulk_selected: 'selected',
    bulk_delete: 'Delete Selected',
    bulk_status: 'Change Status',
    bulk_clear: 'Clear Selection',

    // Optimizer
    opt_title: 'Cargo Optimization',
    opt_run: 'Optimize',
    opt_reset: 'Reset',
    opt_add_item: 'Add Item',
    opt_from_storage: 'Import from Storage',

    // Auth
    login_title: 'Sign In',
    login_email: 'Email',
    login_password: 'Password',
    login_submit: 'Sign In',
  },
} as const;

export type TranslationKey = keyof typeof translations.tr;
