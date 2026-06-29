import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { kv } from '@vercel/kv';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. DESTRUKTURISASI DATA BARU DARI FRONTEND PAYLOAD
    const { 
      email, 
      namaTim, 
      warna,
      logoTim,       // Berisi { original, compressed }
      buktiTransfer, // Berisi { original, compressed }
      players        // Array objek berisi data roster lengkap
    } = data; 

    if (!namaTim) {
      return NextResponse.json({ success: false, message: "Nama tim tidak boleh kosong." }, { status: 400 });
    }

    // Standardisasi slug/kunci untuk database (contoh: "Akatsuki Team" -> "akatsuki-team")
    const teamSlug = namaTim.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    const kvKey = `teams:${teamSlug}`;

    // 2. VALIDASI VERCEL KV: CEK APAKAH TIM SUDAH TERDAFTAR DI DATABASE
    const isTeamExist = await kv.exists(kvKey);
    if (isTeamExist) {
      return NextResponse.json({ 
        success: false, 
        message: `Nama tim "${namaTim}" sudah terdaftar di database. Silakan gunakan nama tim lain.` 
      }, { status: 400 });
    }

    // 3. SIMPAN DATA KE VERCEL KV
    // A. Simpan data detail tim ke dalam Hash
    await kv.hset(kvKey, {
      namaTim: namaTim.trim(),
      warna: warna,
      email: email.trim(),
      logoTim: JSON.stringify(logoTim),
      buktiTransfer: JSON.stringify(buktiTransfer),
      players: JSON.stringify(players),
      createdAt: new Date().toISOString(),
      statusVerifikasi: "Pending" // Status awal untuk diproses Finance/Admin
    });

    // B. Masukkan slug tim ke dalam Global Set agar bisa dilist di halaman pendaftaran/peserta
    await kv.sadd("global:teams", teamSlug);


    // 4. IDENTIFIKASI JABATAN UNTUK EMAIL
    const ketua = players.find((p: any) => p.role === "Ketua") || { namaLengkap: "-", discord: "-", idDuelLinks: "-" };
    const wakil = players.find((p: any) => p.role === "Wakil Ketua") || { namaLengkap: "-", discord: "-", idDuelLinks: "-" };

    // 5. SIAPKAN DISTRIBUSI EMAIL VIA RESEND
    const emailPromises = [];

    // --- A. Email ke Peserta (Konfirmasi Pendaftaran) ---
    if (email) {
      emailPromises.push(
        resend.emails.send({
          from: 'Teamwars Registration <regist@teamwars.web.id>',
          to: email,
          subject: `Pendaftaran Berhasil: Tim ${namaTim}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; line-height: 1.6;">
              <h2 style="color: ${warna || '#3b82f6'};">Halo, Tim ${namaTim}! 🎉</h2>
              <p>Terima kasih telah mendaftar di <strong>TWI Season 7</strong>. Data roster dan bukti transfer Anda telah kami terima di sistem dan tersimpan di database.</p>
              <p>Tim admin & finance kami akan segera melakukan proses verifikasi dokumen. Harap pastikan akun Discord <strong>${ketua.discord}</strong> tetap aktif untuk koordinasi lebih lanjut.</p>
              <br/>
              <p style="font-size: 12px; color: #666;">Maju terus dan persiapkan strategi terbaik tim Anda!</p>
            </div>
          `,
        })
      );
    }

    // --- B. Email ke Finance (Menerima URL Bukti Transfer FULL SIZE) ---
    emailPromises.push(
      resend.emails.send({
        from: 'Teamwars Registration <regist@teamwars.web.id>',
        to: 'finance@teamwars.web.id',
        subject: `[Verifikasi Pembayaran] Tim ${namaTim}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2>Pengecekan Pembayaran Baru</h2>
            <p>Tim <strong style="color: ${warna || '#000'};">${namaTim}</strong> baru saja mendaftar. Mohon segera periksa keaslian mutasi rekening mereka.</p>
            <p><strong>Link Bukti Transfer (Original/Full Size):</strong> <br/> 
               <a href="${buktiTransfer?.original}" target="_blank" style="color: #3b82f6; font-weight: bold;">${buktiTransfer?.original}</a>
            </p>
          </div>
        `,
      })
    );

    // --- C. Email ke Creative (Menerima URL Logo FULL SIZE) ---
    emailPromises.push(
      resend.emails.send({
        from: 'Teamwars Registration <regist@teamwars.web.id>',
        to: 'creative@teamwars.web.id',
        subject: `[Aset Logo] Tim ${namaTim}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2>Aset Logo Tim Baru</h2>
            <p>Berikut adalah aset logo mentah resolusi penuh untuk kebutuhan broadcast/overlay tim <strong>${namaTim}</strong>.</p>
            <p><strong>Link Logo (Original/Full Size):</strong> <br/> 
               <a href="${logoTim?.original}" target="_blank" style="color: #3b82f6; font-weight: bold;">${logoTim?.original}</a>
            </p>
          </div>
        `,
      })
    );

    // --- D. Email ke Admin (Informasi Ringkasan & Roster Lengkap) ---
    emailPromises.push(
      resend.emails.send({
        from: 'Teamwars Registration <regist@teamwars.web.id>',
        to: 'admin@teamwars.web.id',
        subject: `[Registrasi Baru] Data Lengkap Tim ${namaTim}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px;">
            <h2>Data Pendaftaran Tim: ${namaTim}</h2>
            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border-color: #e2e8f0; margin-bottom: 20px;">
              <tr style="background-color: #f8fafc;"><td width="35%"><strong>Nama Tim</strong></td><td><strong style="color: ${warna || '#000'};">${namaTim}</strong></td></tr>
              <tr><td><strong>Warna Identitas</strong></td><td><code>${warna}</code></td></tr>
              <tr><td><strong>Email Kontak</strong></td><td>${email}</td></tr>
              <tr><td><strong>Ketua Tim (Discord)</strong></td><td>${ketua.namaLengkap} (${ketua.discord})</td></tr>
              <tr><td><strong>Wakil Ketua (Discord)</strong></td><td>${wakil.namaLengkap} (${wakil.discord})</td></tr>
              <tr><td><strong>KV Database Key</strong></td><td><code>${kvKey}</code></td></tr>
            </table>

            <h3>📋 Roster Lengkap Pemain</h3>
            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; border-color: #e2e8f0; font-size: 13px;">
              <thead style="background-color: #f1f5f9;">
                <tr>
                  <th>No</th>
                  <th>Jabatan</th>
                  <th>Nama Lengkap</th>
                  <th>Discord</th>
                  <th>IGN</th>
                  <th>ID Duel Links</th>
                </tr>
              </thead>
              <tbody>
                ${players.map((p: any, i: number) => `
                  <tr>
                    <td align="center">${i + 1}</td>
                    <td><strong>${p.role}</strong></td>
                    <td>${p.namaLengkap}</td>
                    <td><code>${p.discord}</code></td>
                    <td>${p.ign}</td>
                    <td style="font-family: monospace;">${p.idDuelLinks}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `,
      })
    );

    // 6. EKSEKUSI SEMUA EMAIL SECARA PARALEL
    await Promise.all(emailPromises);

    // 7. KEMBALIKAN RESPONSE SUKSES
    return NextResponse.json({ success: true, message: "Pendaftaran berhasil disimpan ke KV dan email terdistribusi!" });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
