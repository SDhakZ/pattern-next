import { memo } from "react";
import Image from "next/image";
import png1 from "../../../../assets/png/1.png";
import png2 from "../../../../assets/png/2.png";
import png3 from "../../../../assets/png/3.png";
import png4 from "../../../../assets/png/4.png";
import png5 from "../../../../assets/png/5.png";
import png6 from "../../../../assets/png/6.png";
import png7 from "../../../../assets/png/7.png";
import png8 from "../../../../assets/png/8.png";
import png9 from "../../../../assets/png/9.png";
import png10 from "../../../../assets/png/10.png";
import png11 from "../../../../assets/png/11.png";
import png12 from "../../../../assets/png/12.png";

function createPngMotifComponent(imageSrc) {
  return memo(function PngMotif({ size }) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Image
          src={imageSrc}
          alt="motif preview"
          fill
          sizes="(max-width: 640px) 100px, (max-width: 1024px) 150px, 200px"
          style={{
            objectFit: "contain",
          }}
        />
      </div>
    );
  });
}

export const M01_PNG = createPngMotifComponent(png1);
export const M02_PNG = createPngMotifComponent(png2);
export const M03_PNG = createPngMotifComponent(png3);
export const M04_PNG = createPngMotifComponent(png4);
export const M05_PNG = createPngMotifComponent(png5);
export const M06_PNG = createPngMotifComponent(png6);
export const M07_PNG = createPngMotifComponent(png7);
export const M08_PNG = createPngMotifComponent(png8);
export const M09_PNG = createPngMotifComponent(png9);
export const M10_PNG = createPngMotifComponent(png10);
export const M11_PNG = createPngMotifComponent(png11);
export const M12_PNG = createPngMotifComponent(png12);
