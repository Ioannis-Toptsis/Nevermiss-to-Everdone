import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/seo";
import { SeoPreview } from "@/lib/seo-preview";

export const alt = siteConfig.ogAlt;

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<SeoPreview />, size);
}