import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 판매글 사진은 Supabase Storage에 있어요. <Image>가 그 주소의 사진만 줄여서 보여 줄 수 있게 허락해요.
  images: {
    remotePatterns: [new URL("https://gfcylhusujdvzsoinwoj.supabase.co/storage/v1/object/public/goguma-item-photos/**")],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
