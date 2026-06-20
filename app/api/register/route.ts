import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Memanggil kunci rahasia yang sudah dipasang Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, namaTim, warna, logoTim, buktiTransfer, players } = data;

    // Fungsi canggih untuk mengubah Base64 menjadi File Asli dan mengunggahnya
    const uploadBase64 = async (base64String: string, path: string) => {
      const matches = base64String.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Format gambar tidak valid');
      }
      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');

      const { error } = await supabase.storage
        .from('team_assets')
        .upload(path, buffer, {
          contentType: mimeType,
          upsert: false // Jangan timpa file jika nama sama
        });

      if (error) throw error;
      
      // Ambil Link URL Publik yang bersih
      const { data: publicUrlData } = supabase.storage
        .from('team_assets')
        .getPublicUrl(path);
        
      return publicUrlData.publicUrl;
    };

    // Otomatisasi Penamaan File (Menjawab pertanyaanmu sebelumnya!)
    const timestamp = Date.now();
    const safeTeamName = namaTim.replace(/[^a-zA-Z0-9]/g, '_'); 
    
    // Hasil: /logos/Blue_Eyes_Logo_16800000.png
    const logoPath = `logos/${safeTeamName}_Logo_${timestamp}.png`; 
    const buktiPath = `bukti/${safeTeamName}_Bukti_${timestamp}.jpg`;

    // Mengunggah gambar ke brankas secara bersamaan agar proses cepat
    const [logo_url, bukti_url] = await Promise.all([
      uploadBase64(logoTim, logoPath),
      uploadBase64(buktiTransfer, buktiPath)
    ]);

    // Mengirim keseluruhan teks dan link URL ke Tabel PostgreSQL Supabase
    const { error: dbError } = await supabase
      .from('registrations')
      .insert([
        {
          email,
          nama_tim: namaTim,
          warna,
          logo_url,
          bukti_url,
          players
        }
      ]);

    if (dbError) throw dbError;

    // Mengabari frontend (File 2) bahwa pendaftaran sukses
    return NextResponse.json({ status: 'success', message: 'Pendaftaran berhasil!' });

  } catch (error: any) {
    console.error('Error saat registrasi:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Terjadi kesalahan sistem' }, 
      { status: 500 }
    );
  }
}
