import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* El static export no es compatible con middleware.
   * Para desplegar, usar Vercel (gratis) o Firebase Functions (con costo)
   */
};

export default nextConfig;
