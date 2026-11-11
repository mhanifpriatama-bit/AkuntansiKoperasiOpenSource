/*
 * Manajemen kunci & sandi (tanpa tampilan).
 *
 * Skema: tiap unit (USP, Sembako) punya kunci data acak 32 byte ("raw"). Kunci itu dibungkus dua kali:
 *   wU = dibungkus kunci dari sandi unit  -> unit hanya bisa membuka unitnya sendiri
 *   wA = dibungkus kunci dari sandi Admin -> Konsolidasi (Admin) bisa membuka semua unit
 * `meta` (disimpan di IndexedDB, kunci "meta") berisi salt dan kunci terbungkus itu. Sandi yang hilang tidak
 * bisa dipulihkan. Paket unit (.kdmp.json) hanya bisa dibuka bila sandi Admin sama di semua komputer.
 */
(function (KDMP) {
  'use strict';
  const k = KDMP.security.kripto;
  const UNIT = () => KDMP.config.aplikasi.unit;

  /** Membuat metadata awal dari sandi Admin & tiap unit. @returns {Promise<object>} meta */
  async function buatMeta(sandi) {
    const saltAdmin = k.acak(16);
    const kunciAdmin = await k.turunkanKunci(sandi.Admin, saltAdmin);
    const meta = { saltA: k.keBase64(saltAdmin), units: {} };
    for (const u of UNIT()) {
      const mentah = k.acak(32);
      const saltUnit = k.acak(16);
      meta.units[u] = {
        s: k.keBase64(saltUnit),
        wU: await k.enkripsi(await k.turunkanKunci(sandi[u], saltUnit), mentah),
        wA: await k.enkripsi(kunciAdmin, mentah)
      };
    }
    return meta;
  }

  /**
   * Membuka sesi. unit = 'USP' | 'Sembako' | 'KONSOL'. Melempar galat bila sandi salah.
   * @returns {{DK: CryptoKey, RAW: Uint8Array|Object<string,Uint8Array>}}
   *   unit  : RAW = kunci mentah unit, DK = kunci AES unit
   *   KONSOL: DK = kunci dari sandi Admin, RAW = {unit: kunci mentah}
   */
  async function bukaSesi(meta, unit, sandi) {
    if (unit == 'KONSOL') {
      const DK = await k.turunkanKunci(sandi, k.dariBase64(meta.saltA));
      const RAW = {};
      for (const u of UNIT()) RAW[u] = await k.dekripsi(DK, meta.units[u].wA);
      return { DK, RAW };
    }
    const m = meta.units[unit];
    const RAW = await k.dekripsi(await k.turunkanKunci(sandi, k.dariBase64(m.s)), m.wU);
    return { DK: await k.kunciDariMentah(RAW), RAW };
  }

  /** Mengganti sandi Admin (hanya saat sesi Konsolidasi). Mengubah `meta`; mengembalikan kunci Admin baru. */
  async function gantiSandiAdmin(meta, rawUnit, sandiBaru) {
    const salt = k.acak(16);
    const kunciBaru = await k.turunkanKunci(sandiBaru, salt);
    for (const u of UNIT()) meta.units[u].wA = await k.enkripsi(kunciBaru, rawUnit[u]);
    meta.saltA = k.keBase64(salt);
    return kunciBaru;
  }

  /** Mengganti sandi sebuah unit. `raw` = kunci mentah unit itu. Mengubah `meta`. */
  async function gantiSandiUnit(meta, unit, raw, sandiBaru) {
    const salt = k.acak(16);
    meta.units[unit].s = k.keBase64(salt);
    meta.units[unit].wU = await k.enkripsi(await k.turunkanKunci(sandiBaru, salt), raw);
  }

  KDMP.security.kunci = { buatMeta, bukaSesi, gantiSandiAdmin, gantiSandiUnit };
})(globalThis.KDMP);
