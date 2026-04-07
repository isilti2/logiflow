/**
 * AES-256-GCM alan şifrelemesi
 *
 * Ortam değişkeni: ENCRYPTION_KEY (64 hex karakter = 32 byte)
 * Üretmek için:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Mevcut plaintext verilerle geriye dönük uyumlu:
 *   - Şifreli format:  "<ivHex>:<authTagHex>:<encryptedHex>"
 *   - Plaintext veri : format eşleşmezse olduğu gibi döner (geçiş dönemi)
 */
import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    // Geliştirme ortamı için sabit anahtar — production'da mutlaka değiştirin
    return Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex');
  }
  return Buffer.from(hex, 'hex');
}

const ENC_PREFIX_RE = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/;

export function encrypt(text: string): string {
  if (!text) return text;
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text: string): string {
  if (!text || !ENC_PREFIX_RE.test(text)) return text; // plaintext fallback
  try {
    const [ivHex, authTagHex, encryptedHex] = text.split(':');
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
  } catch {
    return text; // şifre çözme başarısız — orijinali döndür
  }
}

/** Musteri'den şifrelenmiş alanları çöz */
export function decryptMusteri<T extends { vergiNo: string; telefon: string; email: string; adres: string }>(m: T): T {
  return {
    ...m,
    vergiNo: decrypt(m.vergiNo),
    telefon: decrypt(m.telefon),
    email:   decrypt(m.email),
    adres:   decrypt(m.adres),
  };
}

/** Personel'den şifrelenmiş alanları çöz */
export function decryptPersonel<T extends { telefon: string; tcNo: string }>(p: T): T {
  return {
    ...p,
    telefon: decrypt(p.telefon),
    tcNo:    decrypt(p.tcNo),
  };
}
