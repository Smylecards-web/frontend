import Image from "next/image";

import frameSvg from "@/assets/icons/Rectangle 2.svg";

export function IllustrationFrame() {
  return (
    <div className="relative mx-auto aspect-218/235 w-[min(52vw,200px)] max-w-[200px] shrink-0">
      <div className="absolute inset-0">
        <Image
          src={frameSvg}
          alt=""
          fill
          className="object-contain"
          unoptimized
          aria-hidden
        />
      </div>
    </div>
  );
}
