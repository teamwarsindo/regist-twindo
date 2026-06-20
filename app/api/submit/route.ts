import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. KIRIM DATA KE GOOGLE APPS SCRIPT DULU
    const scriptUrl = process.env.APPSCRIPT_URL;
    if (!scriptUrl) throw new Error("APPSCRIPT_URL is not defined");

    const appScriptResponse = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (!appScriptResponse.ok) {
      throw new Error("Gagal menyimpan data ke Google Sheets");
    }

    // 2. AMBIL DATA DARI PAYLOAD
    // Sesuaikan nama variabel ini dengan data yang dikirim dari form Next.js kamu!
    const { 
      email, 
      namaTim, 
      namaKapten, 
      noWhatsapp, 
      linkBuktiTransfer, 
      linkLogo 
    } = data; 

    // 3. SIAPKAN PROMISE UNTUK KIRIM BANYAK EMAIL SEKALIGUS
    const emailPromises = [];

    // --- A. Email ke Peserta ---
    if (email) {
      emailPromises.push(
        resend.emails.send({
          from: 'Teamwars Registration <regist@teamwars.web.id>',
          to: email,
          subject: `Pendaftaran Berhasil: Tim ${namaTim}`,
          html: `
            <div style="font-family: sans-serif;">
              <h2>Halo, Tim ${namaTim}! 🎉</h2>
              <p>Terima kasih telah mendaftar. Data dan bukti transfer Anda telah kami terima.</p>
              <p>Tim kami akan segera memverifikasi pendaftaran Anda.</p>
            </div>
          `,
        })
      );
    }

    // --- B. Email ke Finance (Bukti Transfer) ---
    emailPromises.push(
      resend.emails.send({
        from: 'System Teamwars <regist@teamwars.web.id>',
        to: 'finance@teamwars.web.id',
        subject: `[Verifikasi Pembayaran] Tim ${namaTim}`,
        html: `
          <div style="font-family: sans-serif;">
            <h2>Pengecekan Pembayaran Baru</h2>
            <p>Tim <strong>${namaTim}</strong> baru saja mendaftar. Mohon segera cek bukti transfer mereka.</p>
            <p><strong>Link Bukti Transfer:</strong> <br/> <a href="${linkBuktiTransfer}">${linkBuktiTransfer}</a></p>
          </div>
        `,
      })
    );

    // --- C. Email ke Creative (Logo Tim) ---
    emailPromises.push(
      resend.emails.send({
        from: 'System Teamwars <regist@teamwars.web.id>',
        to: 'creative@teamwars.web.id',
        subject: `[Aset Logo] Tim ${namaTim}`,
        html: `
          <div style="font-family: sans-serif;">
            <h2>Logo Tim Baru</h2>
            <p>Berikut adalah aset logo untuk tim <strong>${namaTim}</strong> yang baru mendaftar.</p>
            <p><strong>Link Logo:</strong> <br/> <a href="${linkLogo}">${linkLogo}</a></p>
          </div>
        `,
      })
    );

    // --- D. Email ke Admin (Informasi Lengkap) ---
    emailPromises.push(
      resend.emails.send({
        from: 'System Teamwars <regist@teamwars.web.id>',
        to: 'admin@teamwars.web.id',
        subject: `[Registrasi Baru] Data Lengkap Tim ${namaTim}`,
        html: `
          <div style="font-family: sans-serif;">
            <h2>Data Pendaftaran Baru</h2>
            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 600px;">
              <tr><td width="30%"><strong>Nama Tim</strong></td><td>${namaTim}</td></tr>
              <tr><td><strong>Kapten</strong></td><td>${namaKapten}</td></tr>
              <tr><td><strong>Email</strong></td><td>${email}</td></tr>
              <tr><td><strong>WhatsApp</strong></td><td>${noWhatsapp}</td></tr>
            </table>
            <p><em>Pastikan data masuk ke Google Sheets dengan benar.</em></p>
          </div>
        `,
      })
    );

    // 4. EKSEKUSI SEMUA EMAIL SECARA PARALEL
    await Promise.all(emailPromises);

    // 5. KEMBALIKAN RESPONSE SUKSES
    return NextResponse.json({ success: true, message: "Pendaftaran dan Distribusi Email Berhasil!" });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
