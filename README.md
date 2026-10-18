<p align="center">
  <img src="public/icons/reacut.png" width="96" height="96" alt="ReaCut Logo" />
</p>
<h1 align="center">ReaCut</h1>
<p align="center"><strong>Tersine mühendislik (REA) prensipleriyle CapCut / Jianying incelenerek sıfırdan geliştirilmiş, tamamen açık kaynaklı ve bağımsız masaüstü video düzenleme stüdyosu.</strong><br />Telif haklarına uygun, mülkiyet kod veya materyalleri içermeyen, yerel ve çevrimdışı kurgu ortamı.</p>
<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/Lisans-MIT-45d6c0" alt="Lisans: MIT" /></a>
  <a href="https://github.com/xavierlayne"><img src="https://img.shields.io/badge/Geli%C5%9Ftirici-%40xavierlayne-blue" alt="Developer: @xavierlayne" /></a>
  <img src="https://img.shields.io/badge/Durum-Erken%20Geli%C5%9Ftirme-orange" alt="Durum: Erken Geliştirme" />
</p>
<p align="center">
  <strong>Türkçe</strong> · <a href="README.en.md">English</a> · <a href="README.zh.md">简体中文</a><br />
  <a href="#h%C4%B1zl%C4%B1-ba%C5%9Flang%C4%B1%C3%A7">Hızlı Başlangıç</a> · <a href="docs/USER_GUIDE.md">Kullanım Kılavuzu</a> · <a href="CHANGELOG.md">Güncelleme Notları</a> · <a href="#katk%C4%B1da-bulunma">Katkıda Bulunma</a>
</p>

![ReaCut Materyal Kütüphanesi, Oynatıcı ve Çok Kanallı Zaman Çizelgesi](docs/screenshots/ui-parity-editor.png)

ReaCut; medya yönetimi, çok kanallı video/ses kurgusu, altyazı desteği ve video dışa aktarma işlemlerini tek bir modern masaüstü çalışma alanında sunar. Temel kurgu motoru tamamen yerel ve çevrimdışı çalışır; hesap oluşturma veya bulut bağlantısı zorunluluğu yoktur.

Proje, Electron, React, TypeScript ve FFmpeg kullanılarak bağımsız olarak inşa edilmiştir.

---

## 🚀 Projede Ne Var ve Neler Eklendi?

### 📌 Çekirdek Özellikler (Mevcut Yetenekler)
| Alan | Neler Yapabilirsiniz? |
| --- | --- |
| **Medya & Kaynak Önizleme** | Video, ses ve görsel dosyalarını dalga boyu ve küçük resimlerle içe aktarma; I/O tuşlarıyla giriş/çıkış noktası belirleme. |
| **Çok Kanallı Kurgu (Timeline)** | Sürükle-bırak, kırpma, bölme, çoğaltma, çoklu seçim, manyetik yapışma (snap), kanal kilitleme ve sessize alma. |
| **Görüntü & Ses Ayarları** | Dönüştürme, kırpma, temel renk ayarları, kroma anahtarı (yeşil ekran / chroma key), maskeler, anahtar kareler (keyframes) ve ses geçişleri. |
| **Yazı & Altyazı Düzenleyici** | SRT ve WebVTT içe aktarma, zaman kaydırma, toplu metin değiştirme, görsel stil şablonları ve SRT dışa aktarma. |
| **Yerel Proje Sistemi** | `.reacut` formatında proje kaydetme, otomatik kurtarma, kayıp medyaları yeniden bağlama. |
| **Video Dışa Aktarma (Export)** | H.264 / AAC kodlayıcılarıyla MP4 ve MOV formatlarında doğrudan donanım hızlandırmalı video render alma. |
| **Yapay Zeka Asistanı** | Google Gemini (3.8-flash) ve CLI destekli akıllı kurgu asistanı. |

### ✨ @xavierlayne Tarafından Yapılan İyileştirmeler ve Eklemeler
1. **Çoklu Dil Desteği (Türkçe / English / 简体中文):** Başlık çubuğuna entegre edilen dinamik dil seçici ile arayüz varsayılan olarak Türkçe, İngilizce ve Çince dilleri arasında anında değiştirilebilir.
2. **Teliften Arındırılmış Marka Kimliği:** Orijinal üretici logoları ve mülkiyet içeren tüm marka unsurları temizlenerek telifsiz, bağımsız `ReaCut` görsel kimliği oluşturuldu.
3. **Geliştirici İmzası & Profil Atfı:** Başlık çubuğuna, durum çubuğuna ve Hakkında modalına `@xavierlayne` rozeti ve profil bağlantıları eklendi.
4. **Gelişmiş Yapay Zeka Sohbet Paneli:** Model yanıt süresi sayacı, kullanılan model göstergesi ve panel geçişlerinde düşünme durumunun korunması sağlandı.

---

## 🛠️ Hızlı Başlangıç

### Kaynak Koddan Çalıştırma

Gereksinimler:
- **Node.js 24+ veya 26+** ve npm
- **FFmpeg ve FFprobe** (`PATH` üzerinde tanımlı olmalıdır)

```sh
# Bağımlılıkları yükleyin
npm ci

# Geliştirici modunda başlatın
npm run dev
```

---

## 📄 Lisans & Katkıcılar

ReaCut kaynak kodları [MIT Lisansı](LICENSE) altında dağıtılmaktadır.

- **Ana Geliştirici & Bakım:** [@xavierlayne](https://github.com/xavierlayne)
- **Katkı Sağlayanlar:** ReaCut Açık Kaynak Topluluğu
