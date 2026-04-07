export type Musteri   = { id: string; ad: string; vergiNo: string; telefon: string; email: string; adres: string; bakiye: number; createdAt: string };
export type Tahsilat  = { id: string; musteriId: string; faturaId: string | null; tutar: number; tarih: string; notlar: string; createdAt: string; musteri?: { id: string; ad: string }; fatura?: { id: string; faturaNo: string; genelToplam: number } | null };
export type Sefer     = { id: string; musteriId: string | null; musteri?: { id: string; ad: string } | null; aracPlaka: string; rotaDan: string; rotaAya: string; mesafeKm: number; tarih: string; yukAgirligi: number; seferUcreti: number; yakitMaliyeti: number; notlar: string; durum: string; createdAt: string };
export type MaliIslem = { id: string; seferId: string | null; musteriId: string | null; sefer?: { rotaDan: string; rotaAya: string } | null; musteri?: { ad: string } | null; tur: string; kategori: string; tutar: number; kdvOrani: number; aciklama: string; tarih: string; createdAt: string };
export type Personel  = { id: string; ad: string; unvan: string; telefon: string; tcNo: string; maas: number; baslangicTarihi: string; aktif: boolean; createdAt: string; _count?: { puantajlar: number } };
export type Puantaj   = { id: string; personelId: string; tarih: string; girisSaati: string | null; cikisSaati: string | null; fazlaMesai: number; izinTuru: string | null; notlar: string; personel?: { id: string; ad: string; unvan: string } };
export type Arac      = { id: string; plaka: string; marka: string; model: string; yil: number | null; ruhsatSon: string | null; sigortaSon: string | null; muayeneSon: string | null; aktif: boolean; notlar: string; createdAt: string; _count?: { yakitKayitlari: number } };
export type YakitKaydi = { id: string; aracId: string; tarih: string; litre: number; birimFiyat: number; toplamTutar: number; kmSayaci: number; istasyon: string; notlar: string; arac?: { id: string; plaka: string; marka: string; model: string } };
export type FaturaSatiri = { aciklama: string; miktar: number; birimFiyat: number; kdvOrani: number };
export type Fatura    = { id: string; faturaNo: string; tarih: string; vadeTarih: string | null; satirlar: string; araToplam: number; kdvToplam: number; genelToplam: number; notlar: string; durum: string; dosyaUrl: string | null; createdAt: string; musteri?: { id: string; ad: string; vergiNo: string; adres: string; email: string; telefon: string } | null; sefer?: { id: string; rotaDan: string; rotaAya: string; aracPlaka: string } | null };
export type Bordro    = { id: string; personelId: string; ay: string; brutMaas: number; fazlaMesaiUcret: number; sgkIsci: number; issizlikIsci: number; gelirVergisi: number; damgaVergisi: number; netMaas: number; sgkIsveren: number; toplamMaliyet: number; createdAt: string; personel?: { id: string; ad: string; unvan: string } };
export type Donem     = { id: string; ay: string; durum: string; notlar: string; kapatildiAt: string | null; createdAt: string };

export type SeferRapor   = { id: string; rotaDan: string; rotaAya: string; aracPlaka: string; tarih: string; durum: string; musteriAd: string | null; seferUcreti: number; yakitMaliyeti: number; toplamGelir: number; toplamGider: number; netKar: number; mesafeKm: number };
export type AracRapor    = { plaka: string; marka: string; model: string; seferGelir: number; seferSayisi: number; yakitTutar: number; kmTopla: number; netKar: number; kmBasiMaliyet: number };
export type MusteriRapor = { id: string; ad: string; vergiNo: string; seferSayisi: number; faturaSayisi: number; toplamFatura: number; toplamTahsilat: number; bakiye: number; bekleyenFatura: number; tahsilatOrani: number };

export type Tab = 'genel' | 'seferler' | 'islemler' | 'cari' | 'araclar' | 'faturalar' | 'personel' | 'raporlar' | 'donem';

export const GIDER_KATEGORILER = ['Yakıt', 'Bakım', 'Sigorta', 'Ruhsat', 'Köprü / Geçiş', 'Personel Maaşı', 'Kira', 'Diğer'];
export const GELIR_KATEGORILER = ['Sefer Ücreti', 'Kira Geliri', 'Diğer'];
export const KDV_ORANLARI      = [0, 10, 20];

export const TL       = (n: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);
export const fmtDate  = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
export const thisMonth = () => new Date().toISOString().slice(0, 7);
