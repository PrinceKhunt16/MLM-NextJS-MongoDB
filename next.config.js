/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    COLUDINARY_URL: process.env.COLUDINARY_URL,
    MONGODB_URI: process.env.MONGODB_URI,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
    BASE_URL: process.env.BASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    TOKEN_NAME: process.env.TOKEN_NAME,
    HASH_DEVIDER: process.env.HASH_DEVIDER,
    STRING_DEVIDER: process.env.STRING_DEVIDER,
    HASH_LENGTH: process.env.HASH_LENGTH,
    CRYPTO_SECRET: process.env.CRYPTO_SECRET,
    DOCUMENTID_REPLACE_KEY: process.env.DOCUMENTID_REPLACE_KEY,
  },
  images: {
    domains: ['res.cloudinary.com'],
  },
}

module.exports = nextConfig