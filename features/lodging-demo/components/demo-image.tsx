import Image from "next/image";

import { cn } from "@/lib/utils";

import type { LodgingImage } from "../types/lodging-demo";

interface DemoImageProps {
  image: LodgingImage;
  /** Valor de `sizes`. Obrigatório porque toda imagem aqui é responsiva. */
  sizes: string;
  className?: string;
  /** Preenche o container posicionado em vez de usar width/height. */
  fill?: boolean;
  priority?: boolean;
}

/**
 * Todas as imagens da página passam por aqui.
 *
 * As artes que acompanham o MVP são SVG locais (ilustrações abstratas, ver
 * `public/demo/README.md`). O otimizador do Next não processa SVG sem
 * `dangerouslyAllowSVG`, e ligar isso globalmente afrouxaria a segurança do
 * app inteiro — então servimos SVG local direto e deixamos o otimizador cuidar
 * dos rasters de verdade que entrarem no lugar depois.
 */
export function DemoImage({
  image,
  sizes,
  className,
  fill = false,
  priority = false,
}: DemoImageProps) {
  const isVector = image.src.toLowerCase().endsWith(".svg");

  // `alt` fica fora do spread para que a regra jsx-a11y consiga enxergá-lo.
  const shared = {
    src: image.src,
    sizes,
    priority,
    unoptimized: isVector,
    className: cn("object-cover", className),
  };

  if (fill) return <Image {...shared} alt={image.alt} fill />;

  return (
    <Image
      {...shared}
      alt={image.alt}
      width={image.width}
      height={image.height}
    />
  );
}
