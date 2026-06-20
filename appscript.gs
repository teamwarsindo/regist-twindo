// ==========================================
// BACK-END: TEAM WARS INDONESIA SEASON 7
// ==========================================
// Konfigurasi ID Google
const SHEET_ID = "1HbfBnE02sJ1R5iwEgP5ooakqHeyXq-Kk9MGP3X78964";
const LOGO_FOLDER_ID = "1n9ObOT_lfGqn_AjpRwhnVXJztJ2KRzw6"; 
const BUKTI_FOLDER_ID = "1PfGUhStd7sw-lOtUbVKaVXYoZzXSKNCP"; 

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const db = SpreadsheetApp.openById(SHEET_ID);
    
    // (Dihapus: setupSheetsOtomatis tidak lagi dipanggil di sini agar lebih cepat)
    
    const sheetTim = db.getSheetByName("Data Tim");
    const sheetPeserta = db.getSheetByName("Peserta");
    
    // 1. Validasi Duplikat & Case-Sensitivity (SINKRON DENGAN NEXT.JS)
    const pesertaData = sheetPeserta.getDataRange().getValues();
    for (let i = 1; i < pesertaData.length; i++) {
      if (pesertaData[i][1].toString().toLowerCase() === data.namaTim.toLowerCase()) {
        return createResponse("error", "Nama Tim sudah terdaftar!");
      }
      for (let p of data.players) {
        if (pesertaData[i][5].toString().toLowerCase() === p.ign.toLowerCase() || 
            pesertaData[i][6].toString() === p.idDuelLinks) {
          return createResponse("error", `Pemain dengan IGN/ID (${p.ign}) sudah terdaftar!`);
        }
      }
    }

    // 2. Sanitasi Nama & Upload ke GDrive
    const safeTeamName = data.namaTim.replace(/[^a-zA-Z0-9]/g, "_"); 
    const logoUrl = saveFileToDrive(data.logoTim, `Logo_${safeTeamName}`, LOGO_FOLDER_ID);
    const buktiUrl = saveFileToDrive(data.buktiTransfer, `Bukti_${safeTeamName}`, BUKTI_FOLDER_ID);
    const timestamp = new Date();

    // 3. Simpan ke Sheet
    sheetTim.appendRow([timestamp, data.namaTim, data.warna, logoUrl, buktiUrl, data.email, data.players.length, "Menunggu Verifikasi", ""]);
    data.players.forEach(pemain => {
      sheetPeserta.appendRow([timestamp, data.namaTim, pemain.role, pemain.namaLengkap, pemain.discord, pemain.ign, pemain.idDuelLinks, "Belum Terafiliasi"]);
    });

    // (Dihapus: Notifikasi Email ke Admin)

    return createResponse("success", "Pendaftaran Berhasil!");

  } catch (error) {
    return createResponse("error", error.toString());
  }
}

// ==========================================
// TRIGGER OTOMATIS: KIRIM EMAIL ZOHO KE PESERTA
// ==========================================
function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== "Data Tim") return;
  
  const row = e.range.getRow();
  if (e.range.getColumn() === 8 && row > 1) { 
    if (e.value === "Terverifikasi" && sheet.getRange(row, 9).getValue() !== "Sudah") {
      const namaTim = sheet.getRange(row, 2).getValue();
      const emailPeserta = sheet.getRange(row, 6).getValue();
      
      const subject = `✅ Pendaftaran Terverifikasi: Selamat Datang di TWI Season 7!`;
      const body = `Halo Kapten Tim ${namaTim},\n\nPembayaran Anda telah kami terima dan diverifikasi. Selamat! Tim Anda resmi terdaftar sebagai peserta TWI Season 7.\n\nLANGKAH WAJIB:\nSilakan bergabung dengan Discord resmi kami:\n👉 https://discord.gg/hTJJRevA43\n\nJika butuh bantuan, DM Admin via Discord ke username: tsaqif.mtz\n\nSalam Esports,\nPanitia Team Wars Indonesia Season 7`;
      
      try {
        GmailApp.sendEmail(emailPeserta, subject, body, {
          from: "regist@teamwars.web.id", // SUDAH MENGGUNAKAN ALIAS BARU
          name: "Panitia TWI Season 7"
        });
        sheet.getRange(row, 9).setValue("Sudah");
      } catch (err) {
        sheet.getRange(row
