import { ImageResponse } from "next/og";

import { SeoIcon } from "@/lib/seo-preview";

export const size = {
  width: 512,
  height: 512
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<SeoIcon />, size);
}