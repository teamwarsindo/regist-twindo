/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/invite',
        destination: 'https://discord.gg/NtBBdqUrxe',
        // Gunakan permanent: false agar jika suatu saat link Discord-mu expired dan kamu ganti link baru, browser pengunjung tidak menyimpan cache link yang lama.
        permanent: false, 
      },
      {
        source: '/rules',
        destination: 'https://docs.google.com/document/d/12nvtsG84Us674fte5joAPLY50wlwxHhJhSLew6wn0cw/edit?usp=drivesdk',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
