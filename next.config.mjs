/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan fungsi redirects di sini
  async redirects() {
    return [
      {
        source: '/fb',
        destination: 'https://www.facebook.com/teamwars.id',
        permanent: true, // Menggunakan HTTP 308 (Permanent Redirect) agar baik untuk SEO
      },
      {
        source: '/ig',
        destination: 'https://www.instagram.com/teamwarsindonesia',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
