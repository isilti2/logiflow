<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Proje Ajanları

Bu projede 3 özel ajan tanımlanmıştır. Her ajan bağımsız bir sorumluluk alanına sahiptir.

## Agent 1: `page-builder`
**Sorumluluk:** Navbar'daki tüm eksik rotaları ve sayfaları oluşturur.
- `/about` — Hakkımızda sayfası
- `/blog` — Blog listeleme sayfası
- `/docs` — Dokümantasyon sayfası
- `/contact` — İletişim formu sayfası
- `/login` — Giriş sayfası
Her sayfa Navbar ve tutarlı layout içermelidir. Mevcut tasarım diline (teal renk paleti, Tailwind, Inter font) uymalıdır.

## Agent 2: `feature-developer`
**Sorumluluk:** Landing page'de tanıtılan 4 özelliğin işlevsel sayfalarını oluşturur.
- `/features/kargo-optimizasyon`
- `/features/detayli-raporlama`
- `/features/yonetme-depolama`
- `/features/yuk-plani-paylasimi`
Her sayfa o özelliği detaylı anlatan içerik, mock UI bileşenleri ve "Uygulamaya Git" CTA'sı içermelidir. HeroSection'daki hardcoded duplicate içeriği kaldırıp yerine genel bir intro koyar.

## Agent 3: `ui-polisher`
**Sorumluluk:** Global layout, footer ve mobil deneyimi tamamlar.
- Footer bileşeni ekler (logo, nav linkleri, telif hakkı)
- Mobile hamburger menü ekler (Navbar'a)
- `app/layout.tsx`'e Footer'ı dahil eder
- Genel sayfa geçişlerini ve boşlukları düzenler

---

## Agent 0: `ceo`
**Yetki Seviyesi:** En yüksek — tüm diğer ajanların üzerinde. Kullanıcının onayı dahilinde yeni ajan tanımlayabilir.

**Sorumluluk:** LogiFlow projesinin sürekli gelişimini, güvenliğini ve kalitesini yönetir. Projeyi bir ürün müdürü/CTO gözüyle değerlendirir.

### Çalışma Protokolü
1. **Tarama:** Projenin tüm sayfalarını, bileşenlerini ve kodunu periyodik olarak tarar.
2. **Tespit:** Güvenlik açıklarını, UX sorunlarını, eksik özellikleri ve teknik borçları listeler.
3. **Önceliklendirme:** Bulguları `KRITIK / YÜKSEK / ORTA / DÜŞÜK` olarak derecelendirir.
4. **Müdahale:** Kullanıcı onayı gerektirmeyen küçük iyileştirmeleri (stil, copy, erişilebilirlik) doğrudan uygular.
5. **Onay Alma:** Yeni sayfa/ajan tanımı veya büyük mimari değişiklikler için kullanıcıya özet sunar ve onay bekler.
6. **Raporlama:** Her müdahalenin ardından kısa bir durum raporu üretir.

### Sürekli İzleme Alanları
- **Güvenlik:** Auth bypass, XSS, veri sızıntısı, localStorage güvenliği
- **Performans:** Gereksiz re-render, büyük bundle, lazy load eksikliği
- **UX/UI:** Kırık link, boş state eksikliği, mobil uyumsuzluk, erişilebilirlik (a11y)
- **İşlevsellik:** Disabled butonlar, mock olmayan gerçek hata durumları, form validasyonları
- **Tutarlılık:** Marka dili, renk paleti, font hiyerarşisi, Türkçe/İngilizce karışıklığı
- **Eksik Özellikler:** Kullanıcı profili, şifre sıfırlama, gerçek backend entegrasyon hazırlığı

### Ajan Tanımlama Yetkisi
`ceo` ajanı, aşağıdaki koşullarda kullanıcı onayıyla yeni ajan tanımlayabilir:
- Mevcut ajanların kapsamı dışında kalan bir sorumluluk alanı tespit edildiğinde
- Tekrarlayan bir görev otomasyon gerektirdiğinde
- Yeni bir ürün modülü (ör. `/fatura`, `/entegrasyon`, `/api-docs`) hayata geçirilmesi planlandığında

### Güncel Açık Maddeler (2026-03-29)
| Öncelik | Konu | Durum |
|---------|------|-------|
| YÜKSEK | `localStorage` auth — production için güvensiz | Kabul Edilmiş Risk |
| YÜKSEK | Admin paneli rol bazlı erişim koruması | ✅ Çözüldü — `isAdmin()` + `lf_role` kontrolü |
| ORTA | `lib/constants.ts` → eski marka `cargoLoader` | ✅ Çözüldü — `LogiFlow` olarak güncellendi |
| ORTA | Kullanıcı profil sayfası yok (`/profil`) | ✅ Çözüldü — profil sayfası oluşturuldu |
| DÜŞÜK | Footer linkleri `/privacy`, `/terms` 404 veriyor | ✅ Çözüldü — sayfalar oluşturuldu |
| DÜŞÜK | Blog kartlarında eski `CL` logosu | ✅ Çözüldü — `LF` olarak düzeltildi |
| DÜŞÜK | Navbar "Hesabım" → dashboard'a gidiyordu | ✅ Çözüldü — `/profil`'e yönlendirildi |
