import { NavItem, FeatureSectionData } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Hakkımızda', href: '/about' },
  { label: 'Fiyatlandırma', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Docs', href: '/docs' },
  { label: 'İletişim', href: '/contact' },
  { label: 'Depolama', href: '/depolama' },
];

export const FEATURES: FeatureSectionData[] = [
  {
    id: 'kargo-optimizasyon',
    title: 'Kargo ',
    titleHighlight: 'Optimizasyon',
    description: 'Gelişmiş kargo optimizasyonu ile etkin kargo optimizasyonunu deneyimleyin algoritmaları ve optimum kargo düzenlemeleri için sezgisel 3D görselleştirme.',
    features: [
      { text: 'Süper Hızlı Sonuçlar' },
      { text: 'Optimal Yerleştirme' },
      { text: 'Web Tabanlı' },
      { text: '3D Görünüm' },
    ],
    imageSide: 'left',
    imageAlt: 'Kargo optimizasyon ekranı',
    mockupLabel: 'LogiFlow App',
  },
  {
    id: 'detayli-raporlama',
    title: 'Detaylı ',
    titleHighlight: 'Raporlama',
    description: 'Kapsamlı raporlama araçlarımızla lojistik performansınız hakkında bilgi edinin. Konteyner kullanımı, kamyon yükleme verimliliği ve genel lojistik performansı hakkında ayrıntılı raporlara erişin operasyonel performans.',
    features: [
      { text: 'Hepsi Bir Arada PDF Dosyası' },
      { text: 'Grafiksel Analizler' },
    ],
    imageSide: 'right',
    imageAlt: 'Detaylı raporlama ekranı',
    mockupLabel: 'LogiFlow Reports',
  },
  {
    id: 'yonetme-depolama',
    title: 'Yönetme ',
    titleHighlight: 've Depolama',
    description: 'Kullanıcılar önceden tanımlanmış alanları ve kargo konteynerlerini şu şekilde yönetebilir gönderilerini kişiselleştirilmiş alanlarla depolamanın yanı sıra, kolay organizasyon ve erişebilirlik.',
    features: [
      { text: 'Önceden Tanımlı Çoklu Alanlar' },
      { text: 'Bulut Tabanı Depolama' },
      { text: 'Microsoft Excel İçe Aktarma' },
    ],
    imageSide: 'left',
    imageAlt: 'Yönetme ve depolama ekranı',
    mockupLabel: 'LogiFlow Storage',
  },
  {
    id: 'yuk-plani-paylasimi',
    title: 'Yük Planı ',
    titleHighlight: 'Paylaşımı',
    description: 'Optimize edilmiş konteyner ve ekipman paylaşımı ile lojistik iletişiminizi zahmetsizce kolaylaştırın. tek bir tıklama ile kamyon konfigürasyonları.',
    features: [
      { text: 'Hesapsız Erişim' },
      { text: '3D Görünüm' },
    ],
    imageSide: 'right',
    imageAlt: 'Yük planı paylaşımı ekranı',
    mockupLabel: 'LogiFlow Share',
  },
];
