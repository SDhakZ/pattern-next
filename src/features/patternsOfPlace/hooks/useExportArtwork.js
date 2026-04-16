import { useCallback } from "react";
import { tangentSize, polar, presetFitScale } from "../domain/geometry.js";
import { DEFAULT_COLORS } from "../data/constants/defaults.js";
import { triggerDownload, svgStringToCanvas } from "../utils/download.js";
import { renderNewMotifMarkup } from "../data/motifs/newMotifs.jsx";

// ─── Inline SVG helpers ───────────────────────────────────────────────────────

function getInlineSVG(id, a, b, c, d, e) {
  if (id >= 9) {
    const rendered = renderNewMotifMarkup(id, [a, b, c, d, e]);
    if (rendered) return rendered;
  }

  const P = {
    0: `<polygon fill="${b}" points="995 262.99 994.29 5.71 737.01 5 734.59 7.42 371 371 7.42 734.59 5 737.01 5.72 994.29 262.99 995 629 629 995 262.99"/><polygon fill="${b}" points="5 262.99 5.71 5.71 262.99 5 265.41 7.42 629 371 992.58 734.59 995 737.01 994.28 994.29 737.01 995 371 629 5 262.99"/><path fill="${a}" d="M210.71,619.7c-99.15,99.15-94.73,264.32-94.73,264.32,0,0,165.17,4.42,264.32-94.73,99.15-99.15,141.56-217.49,94.73-264.32-46.83-46.83-165.17-4.42-264.32,94.73Z"/><path fill="${a}" d="M620.32,210.09c99.15-99.15,264.32-94.73,264.32-94.73,0,0,4.42,165.17-94.73,264.32-99.15,99.15-217.49,141.56-264.32,94.73-46.83-46.83-4.42-165.17,94.73-264.32Z"/><path fill="${a}" d="M380.3,210.09C281.15,110.94,115.97,115.36,115.97,115.36c0,0-4.42,165.17,94.73,264.32,99.15,99.15,217.49,141.56,264.32,94.73,46.83-46.83,4.42-165.17-94.73-264.32Z"/><path fill="${a}" d="M789.91,619.7c99.15,99.15,94.73,264.32,94.73,264.32,0,0-165.17,4.42-264.32-94.73-99.15-99.15-141.56-217.49-94.73-264.32,46.83-46.83,165.17-4.42,264.32,94.73Z"/><circle fill="${a}" cx="501.09" cy="499.17" r="257.47"/><circle fill="${c}" cx="501.09" cy="499.17" r="126.68"/><circle fill="${a}" cx="501.09" cy="499.17" r="65.75"/>`,
    1: `<polygon fill="${a}" points="10.54 500 489.25 14.21 489.25 985.78 10.54 500"/><path fill="${e}" d="M492.8,995L5,500l3.27-3.31L492.8,5v990ZM16.07,500l469.63,476.57V23.43L16.07,500Z"/><polygon fill="${a}" points="989.46 500 510.75 14.21 510.75 985.78 989.46 500"/><path fill="${e}" d="M507.2,995l487.8-495-3.27-3.31L507.2,5v990ZM983.93,500l-469.63,476.57V23.43l469.63,476.57Z"/><path fill="${d}" d="M251.81,501.13c.01-12.45,22.44-36.78,22.44-36.78,0,0-74.53-22.07-89.42-88.28,0,0-42.67,4.39-39.71,66.42,0,0-31.68-18.84-62.53,28.7-14.72,22.68-25.2,29.95-25.2,29.95,0,0,15.41,16.62,23.78,29.64,8.37,13.02,39.94,44.49,64.13,26.38,0,0-2.91,66.78,39.07,66.78,0,0,9.59-56.52,89.71-84.88,0,0-22.28-25.43-22.27-37.92Z"/><path fill="${d}" d="M712.09,552.13c11.16,6.36,25.61,11.85,36.01,19.87,11.2,8.64,22.96,17.63,31.55,29.93,8.36,11.97,13.86,24.02,12.47,40.53-1.31,15.6-16.93,26.24-27.93,27.38,0,0-2.97,40.96-50.87,65.29,0,0,26.22-95.85-34.71-156.4,0,0,14.18-8.04,33.49-26.6Z"/><path fill="${d}" d="M287.91,552.13c-11.16,6.36-25.61,11.85-36.01,19.87-11.2,8.64-22.96,17.63-31.55,29.93-8.36,11.97-13.86,24.02-12.47,40.53,1.31,15.6,16.93,26.24,27.93,27.38,0,0,2.97,40.96,50.87,65.29,0,0-26.22-95.85,34.71-156.4,0,0-14.18-8.04-33.49-26.6Z"/><path fill="${d}" d="M659.99,587.78s43.72,43.01,39.07,114.88c-4.65,71.87-39.07,60.55-39.07,60.55,0,0-4.65,53.19-50.23,81.49-45.58,28.29-51.16,39.61-60.93,62.25,0,0-24.65-20.94-4.65-126.76,0,0,0-10.19-4.65-32.82-4.65-22.64,1.86-79.79,34.88-78.66,33.02,1.13,43.31,47.61,31.69,75.9,0,0,21.55-4.1,11.78-48.81-9.77-44.71-45.85-60.9-45.85-60.9,0,0,50.81-20.92,87.96-47.11Z"/><path fill="${d}" d="M340.01,587.78s-43.72,43.01-39.07,114.88c4.65,71.87,39.07,60.55,39.07,60.55,0,0,4.65,53.19,50.23,81.49,45.58,28.29,51.16,39.61,60.93,62.25,0,0,24.65-20.94,4.65-126.76,0,0,0-10.19,4.65-32.82,4.65-22.64-1.86-79.79-34.88-78.66-33.02,1.13-43.31,47.61-31.69,75.9,0,0-21.55-4.1-11.78-48.81,9.77-44.71,45.85-60.9,45.85-60.9,0,0-50.81-20.92-87.96-47.11Z"/><path fill="${d}" d="M712.09,450.27c11.16-6.36,25.61-11.85,36.01-19.87,11.2-8.64,22.96-17.63,31.55-29.93,8.36-11.97,13.86-24.02,12.47-40.53-1.31-15.6-16.93-26.24-27.93-27.38,0,0-2.97-40.96-50.87-65.29,0,0,26.22,95.85-34.71,156.4,0,0,14.18,8.04,33.49,26.6Z"/><path fill="${d}" d="M287.91,450.27c-11.16-6.36-25.61-11.85-36.01-19.87-11.2-8.64-22.96-17.63-31.55-29.93-8.36-11.97-13.86-24.02-12.47-40.53,1.31-15.6,16.93-26.24,27.93-27.38,0,0,2.97-40.96,50.87-65.29,0,0-26.22,95.85,34.71,156.4,0,0-14.18,8.04-33.49,26.6Z"/><path fill="${d}" d="M659.99,414.62s43.72-43.01,39.07-114.88c-4.65-71.87-39.07-60.55-39.07-60.55,0,0-4.65-53.19-50.23-81.49-45.58-28.29-51.16-39.61-60.93-62.25,0,0-24.65,20.94-4.65,126.76,0,0,0,10.19-4.65,32.82-4.65,22.64,1.86,79.79,34.88,78.66,33.02-1.13,43.31-47.61,31.69-75.9,0,0,21.55,4.1,11.78,48.81-9.77,44.71-45.85,60.9-45.85,60.9,0,0,50.81,20.92,87.96,47.11Z"/><path fill="${d}" d="M340.01,414.62s-43.72-43.01-39.07-114.88c4.65-71.87,39.07-60.55,39.07-60.55,0,0,4.65-53.19,50.23-81.49,45.58-28.29,51.16-39.61,60.93-62.25,0,0,24.65,20.94,4.65,126.76,0,0,0,10.19,4.65,32.82,4.65,22.64-1.86,79.79-34.88,78.66-33.02-1.13-43.31-47.61-31.69-75.9,0,0-21.55,4.1-11.78,48.81,9.77,44.71,45.85,60.9,45.85,60.9,0,0-50.81,20.92-87.96,47.11Z"/><path fill="${b}" d="M451.69,391.7v220.7s-144.73-34.66-177.44-112.4c0,0,16.88-52.77,177.44-108.3Z"/><path fill="${b}" d="M548.31,391.7v220.7s144.73-34.66,177.44-112.4c0,0-16.88-52.77-177.44-108.3Z"/>`,
    2: `<path fill="${b}" stroke="${a}" stroke-width="7" d="M501.01,350.07c-24.5,24.11-82.67,42.26-106.78,17.75-24.11-24.5-5.04-82.37,19.46-106.49s63.91-23.8,88.03.7c24.11,24.5,23.8,63.91-.7,88.03Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M349.88,498.8c24.5-24.11,43.57-81.98,19.46-106.49-24.11-24.5-82.28-6.36-106.78,17.75-24.5,24.11-24.82,63.52-.7,88.03,24.11,24.5,63.52,24.82,88.03.7Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M411.78,499.3c-24.11-24.5-42.26-82.67-17.75-106.78,24.5-24.11,82.37-5.04,106.49,19.46s23.8,63.91-.7,88.03-63.91,23.8-88.03-.7Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M263.05,348.16c24.11,24.5,81.98,43.57,106.49,19.46,24.5-24.11,6.36-82.28-17.75-106.78-24.11-24.5-63.52-24.82-88.03-.7-24.5,24.11-24.82,63.52-.7,88.03Z"/><polygon fill="${d}" stroke="${a}" stroke-width="7" points="452.71 310.27 405.74 380.26 451.58 450.99 381.59 404.02 310.86 449.86 357.83 379.88 311.99 309.14 381.98 356.11 452.71 310.27"/><circle fill="${c}" stroke="${a}" stroke-width="6" cx="381.78" cy="380.07" r="62.25"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M737.07,589.93c-24.5,24.11-82.67,42.26-106.78,17.75-24.11-24.5-5.04-82.37,19.46-106.49,24.5-24.11,63.91-23.8,88.03.7,24.11,24.5,23.8,63.91-.7,88.03Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M585.93,738.66c24.5-24.11,43.57-81.98,19.46-106.49-24.11-24.5-82.28-6.36-106.78,17.75-24.5,24.11-24.82,63.52-.7,88.03,24.11,24.5,63.52,24.82,88.03.7Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M647.84,739.16c-24.11-24.5-42.26-82.67-17.75-106.78,24.5-24.11,82.37-5.04,106.49,19.46,24.11,24.5,23.8,63.91-.7,88.03-24.5,24.11-63.91,23.8-88.03-.7Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M499.11,588.03c24.11,24.5,81.98,43.57,106.49,19.46,24.5-24.11,6.36-82.28-17.75-106.78-24.11-24.5-63.52-24.82-88.03-.7s-24.82,63.52-.7,88.03Z"/><polygon fill="${d}" stroke="${a}" stroke-width="7" points="688.76 550.14 641.8 620.12 687.64 690.86 617.65 643.89 546.92 689.73 593.88 619.74 548.04 549.01 618.03 595.98 688.76 550.14"/><circle fill="${c}" stroke="${a}" stroke-width="6" cx="617.84" cy="619.93" r="62.25"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M261.15,586.12c-24.5,24.11-82.67,42.26-106.78,17.75-24.11-24.5-5.04-82.37,19.46-106.49,24.5-24.11,63.91-23.8,88.03.7,24.11,24.5,23.8,63.91-.7,88.03Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M110.01,734.85c24.5-24.11,43.57-81.98,19.46-106.49-24.11-24.5-82.28-6.36-106.78,17.75-24.5,24.11-24.82,63.52-.7,88.03,24.11,24.5,63.52,24.82,88.03.7Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M171.92,735.35c-24.11-24.5-42.26-82.67-17.75-106.78,24.5-24.11,82.37-5.04,106.49,19.46,24.11,24.5,23.8,63.91-.7,88.03-24.5,24.11-63.91,23.8-88.03-.7Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M23.19,584.22c24.11,24.5,81.98,43.57,106.49,19.46,24.5-24.11,6.36-82.28-17.75-106.78-24.11-24.5-63.52-24.82-88.03-.7-24.5,24.11-24.82,63.52-.7,88.03Z"/><polygon fill="${d}" stroke="${a}" stroke-width="7" points="212.84 546.33 165.88 616.31 211.72 687.05 141.73 640.08 71 685.92 117.96 615.93 72.12 545.2 142.11 592.17 212.84 546.33"/><circle fill="${c}" stroke="${a}" stroke-width="6" cx="141.92" cy="616.12" r="62.25"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M977.31,353.51c-24.5,24.11-82.67,42.26-106.78,17.75-24.11-24.5-5.04-82.37,19.46-106.49,24.5-24.11,63.91-23.8,88.03.7,24.11,24.5,23.8,63.91-.7,88.03Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M826.18,502.24c24.5-24.11,43.57-81.98,19.46-106.49-24.11-24.5-82.28-6.36-106.78,17.75-24.5,24.11-24.82,63.52-.7,88.03,24.11,24.5,63.52,24.82,88.03.7Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M888.08,502.73c-24.11-24.5-42.26-82.67-17.75-106.78s82.37-5.04,106.49,19.46c24.11,24.5,23.8,63.91-.7,88.03-24.5,24.11-63.91,23.8-88.03-.7Z"/><path fill="${b}" stroke="${a}" stroke-width="7" d="M739.35,351.6c24.11,24.5,81.98,43.57,106.49,19.46,24.5-24.11,6.36-82.28-17.75-106.78-24.11-24.5-63.52-24.82-88.03-.7-24.5,24.11-24.82,63.52-.7,88.03Z"/><polygon fill="${d}" stroke="${a}" stroke-width="7" points="929 313.71 882.04 383.7 927.88 454.43 857.89 407.46 787.16 453.3 834.12 383.32 788.28 312.58 858.27 359.55 929 313.71"/><circle fill="${c}" stroke="${a}" stroke-width="6" cx="858.08" cy="383.51" r="62.25"/>`,
    3: `<path fill="${b}" stroke="${c}" stroke-width="5" d="M982.85,726.76l-226.76-226.76,226.76-226.76c16.2-16.2,16.2-42.46,0-58.66L785.42,17.15c-16.2-16.2-42.46-16.2-58.66,0l-226.76,226.76L273.24,17.15c-16.2-16.2-42.46-16.2-58.66,0L17.15,214.58c-16.2,16.2-16.2,42.46,0,58.66l226.76,226.76L17.15,726.76c-16.2,16.2-16.2,42.46,0,58.66l197.43,197.43c16.2,16.2,42.46,16.2,58.66,0l226.76-226.76,226.76,226.76c16.2,16.2,42.46,16.2,58.66,0l197.43-197.43c16.2-16.2,16.2-42.46,0-58.66Z"/><polygon fill="${e}" stroke="${c}" stroke-width="5" points="772.43 227.57 597.56 500 772.43 772.43 500 597.56 227.57 772.43 402.44 500 227.57 227.57 500 402.44 772.43 227.57"/><polygon fill="${d}" stroke="${c}" stroke-width="4" points="716.73 500 555.01 555.01 500 716.73 444.99 555.01 283.27 500 444.99 444.99 500 283.27 555.01 444.99 716.73 500"/><circle fill="${a}" stroke="${c}" stroke-width="5" cx="500" cy="500" r="122.7"/><circle fill="${e}" stroke="${c}" stroke-width="5" cx="500" cy="500" r="31.26"/>`,
    4: `<polygon fill="${a}" stroke="${b}" stroke-width="9" points="246.6 512.35 5.53 753.76 5.71 995 246.95 994.83 488.02 753.41 487.84 512.17 246.6 512.35"/><polygon fill="${a}" stroke="${b}" stroke-width="9" points="487.66 246.6 246.24 5.54 5 5.71 5.17 246.95 246.59 488.02 487.83 487.84 487.66 246.6"/><polygon fill="${a}" stroke="${b}" stroke-width="9" points="753.4 487.65 994.46 246.24 994.29 5 753.05 5.17 511.98 246.59 512.15 487.83 753.4 487.65"/><polygon fill="${a}" stroke="${b}" stroke-width="9" points="512.34 753.39 753.76 994.46 995 994.29 994.83 753.05 753.41 511.98 512.17 512.15 512.34 753.39"/><path fill="${d}" d="M638.41,361.21h0c142.14,0,257.38-115.23,257.38-257.38h0c-142.14,0-257.38,115.23-257.38,257.38h0Z"/><path fill="${d}" d="M895.79,895.4h0c-142.14,0-257.38-115.23-257.38-257.38h0c142.14,0,257.38,115.23,257.38,257.38h0Z"/><path fill="${d}" d="M360.01,361.21h0c-142.14,0-257.38-115.23-257.38-257.38h0c142.14,0,257.38,115.23,257.38,257.38h0Z"/><path fill="${d}" d="M102.63,895.4h0c142.14,0,257.38-115.23,257.38-257.38h0c-142.14,0-257.38,115.23-257.38,257.38h0Z"/>`,
    5: `<path fill="${a}" d="M927.21,200.87l-137.19,298.92,137.62,298.72c37.66,81.75-46.7,166.24-128.51,128.7l-298.92-137.19-298.72,137.62c-81.75,37.66-166.24-46.7-128.7-128.51l137.19-298.92L72.36,201.49C34.7,119.74,119.07,35.25,200.87,72.79l298.92,137.19,298.72-137.62c81.75-37.66,166.24,46.7,128.7,128.51Z"/><path fill="${e}" d="M81.45,919.15c-33.66-33.61-42.59-83.26-22.75-126.49l134.21-292.44L58.29,207.97c-19.9-43.2-11.05-92.86,22.56-126.52,33.61-33.66,83.26-42.59,126.49-22.75l292.44,134.21L792.03,58.29c43.2-19.9,92.87-11.04,126.52,22.56,33.66,33.61,42.58,83.26,22.75,126.49l-134.22,292.44,134.64,292.25c19.9,43.2,11.04,92.86-22.57,126.52-33.61,33.66-83.26,42.58-126.49,22.74l-292.44-134.21-292.25,134.64c-43.2,19.9-92.86,11.04-126.52-22.57Z"/><circle fill="${b}" cx="500" cy="500" r="214.38"/><path fill="${e}" d="M336.3,663.94c-90.39-90.27-90.5-237.24-.23-327.64,90.27-90.39,237.24-90.5,327.64-.24s90.5,237.24.24,327.64c-90.27,90.4-237.24,90.5-327.64.24ZM639.26,360.54c-76.9-76.79-201.94-76.7-278.72.2-76.79,76.9-76.7,201.94.2,278.73,76.9,76.79,201.94,76.7,278.73-.2,76.79-76.9,76.7-201.94-.2-278.72Z"/><circle fill="${d}" cx="500" cy="500" r="135.19"/>`,
    6: `<circle fill="${b}" stroke="${e}" stroke-width="6.17" cx="500" cy="491.57" r="491.86"/><circle fill="${a}" stroke="${e}" stroke-width="5.1" cx="500" cy="491.57" r="366.98"/><circle fill="none" stroke="${e}" stroke-width="6.17" cx="499.11" cy="489.5" r="132.98"/><path fill="${c}" stroke="${e}" stroke-width="6.17" d="M499.29,362.5c-61.39,0-92.15,28.85-92.15,28.85,0,0-143.85-110.94-61.68-181.06,83.85-71.56,141.46,15.78,150.75,32.08.74,1.3,2.53,1.45,3.45.27,12.28-15.71,85.91-101.52,155.77-31.65,79.31,79.31-59.68,186.59-59.68,186.59,0,0-38.93-35.08-96.47-35.08Z"/><path fill="${c}" stroke="${e}" stroke-width="6.17" d="M499.29,620.65c-61.39,0-92.15-28.85-92.15-28.85,0,0-143.85,110.94-61.68,181.06,83.85,71.56,141.46-15.78,150.75-32.08.74-1.3,2.53-1.45,3.45-.27,12.28,15.71,85.91,101.52,155.77,31.65,79.31-79.31-59.68-186.59-59.68-186.59,0,0-38.93,35.08-96.47,35.08Z"/><path fill="${c}" stroke="${e}" stroke-width="6.17" d="M630.8,487.64c0-61.39-28.85-92.15-28.85-92.15,0,0,110.94-143.85,181.06-61.68,71.56,83.85-15.78,141.46-32.08,150.75-1.3.74-1.45,2.53-.27,3.45,15.71,12.28,101.52,85.91,31.65,155.77-79.31,79.31-186.59-59.68-186.59-59.68,0,0,35.08-38.93,35.08-96.47Z"/><path fill="${c}" stroke="${e}" stroke-width="6.17" d="M369.2,486.14c0-61.39,28.85-92.15,28.85-92.15,0,0-110.94-143.85-181.06-61.68-71.56,83.85,15.78,141.46,32.08,150.75,1.3.74,1.45,2.53.27,3.45-15.71,12.28-101.52,85.91-31.65,155.77,79.31,79.31,186.59-59.68,186.59-59.68,0,0-35.08-38.93-35.08-96.47Z"/><circle fill="${d}" stroke="${e}" stroke-width="6.17" cx="500" cy="491.57" r="61.58"/>`,
    7: `<circle fill="${b}" cx="500" cy="693" r="113.72"/><path fill="${e}" d="M981.35,565.57c-7.61-22.59-24.59-40.44-50.46-53.06-68.01-33.16-127.04-12.23-158.36,7.85,5.67-10.94,11.37-26.04,16.06-48.71,7.77-37.53-12.47-70.05-24.57-89.49-3.67-5.9-7.14-11.48-7.9-14.25-4.38-15.9-.39-29.42-.36-29.53l2.05-6.58-6.47-2.37c-.83-.3-20.86-7.34-59.29,4.47-18.62,5.72-41.43,21.12-62.11,42.1,4.57-10.08,8.82-20.8,11.96-31.89,5.55-19.61,12.83-57.69-.7-92.54-10.59-27.27-30.54-48.64-49.83-69.31l-5.04-5.41c-25.65-27.66-53.46-54.79-82.65-80.65l-4.52-4-5.28,4.14c-31.11,24.45-60.51,47.53-86.81,74.57-53.74,55.23-73.82,121.66-53.72,177.68,2.35,6.55,5.22,13.01,8.42,19.39-18.34-16.86-37.66-29.11-53.82-34.08-38.42-11.81-58.46-4.78-59.29-4.47l-6.41,2.38,1.98,6.54c.04.14,4.03,13.66-.35,29.56-.76,2.78-4.23,8.35-7.91,14.25-12.09,19.44-32.33,51.97-24.56,89.49,4.69,22.66,10.39,37.77,16.05,48.71-31.33-20.07-90.35-41.01-158.35-7.85-25.87,12.62-42.85,30.47-50.46,53.06-12.68,37.61,5.45,74.33,6.23,75.87l3.63,7.2,6.77-4.38c14.56-9.43,27.8-12.04,40.5-7.96,33.52,10.78,54.77,64.99,64.99,91.05,2.12,5.42,3.8,9.71,5.14,12.42.43.89,1.03,2.21,1.81,3.92,53.82,118.04,127.29,152.96,179.46,161.47,11.11,1.82,21.58,2.64,31.44,2.64,90.83,0,129.48-70.01,135.3-81.7,1.65.06,3.31.09,4.97.09,2.4,0,4.78-.06,7.15-.19,5.62,11.37,44.23,81.8,135.34,81.8,9.85,0,20.34-.82,31.44-2.64,52.17-8.51,125.64-43.43,179.46-161.47.78-1.71,1.38-3.03,1.81-3.92,1.34-2.71,3.02-7,5.14-12.42,10.22-26.06,31.47-80.27,64.99-91.05,12.7-4.08,25.95-1.47,40.5,7.96l6.77,4.38,3.63-7.2c.78-1.54,18.91-38.26,6.23-75.87Z"/><circle fill="${d}" cx="500" cy="693" r="60"/>`,
    8: `<path fill="${b}" stroke-width="4" d="M473.81,144.09s-174.41,46.68-147.13,257.92c23.31,180.44,198.57,191.09,241.03,186.7,49.98-5.16,103.71-53.88,123.52-120.56,15.72-52.91,5.33-156.13-46.61-177.44-51.94-21.3-74.04,9.42-74.8,22.87-1.32,23.26,16.43,31.22,26.27,31.22,19.94,0,40.58,5.88,51.74,45.19,8.5,29.94-12.31,86.65-50.81,113.06-38.5,26.41-79.35,20.78-106.47,17.22-44.76-5.86-113-64.6-122.13-126.19-9.13-61.59-4.56-195.55,132.52-234.57,101.87-29,151.89,44.26,166.2,55.99,0,0-1.95-85.75,64.44-68.26,54.74,14.42,32.74,82.71,24.13,93.08,0,0,56.05-53.2,96.27-12.98,45.82,45.82.77,99.62.77,99.62,0,0,43.59-20.51,68.89-1.24,45.31,34.51,54.79,119.01-17.62,148.84,0,0,88.71,9.59,88.71,95.85,0,78.12-83.97,70.36-83.97,70.36,0,0,82.61,125.72-56.35,195.09-92.58,46.22-186.28-11.09-193.38-80.58-4.89-47.83,28.27-85.05,69.73-69.66,21.3,7.91,13.08,29.9,33.35,25,17.11-4.14,35.12-53-14.18-61.8-49.29-8.8-48.49,30-99.4,45.27-47.8,14.34-157.75,10.13-248.17-73.37,0,0-6.33,58.88,59.78,85.66,66.11,26.77,89.07,4.74,119.57,13.87,24.82,7.43,51.22,20.42,51.22,76.42,0,69.78-151.2,55.25-157.12,52.38,0,0,82.55-35.8,42.1-85.58,0,0-.71,75.12-92.48,75.12-80.25,0-91.89-39.21-91.89-39.21,0,0,42-62.76-8.38-113.14,0,0,17.95,156.21-138.01,178.2C29.19,886.44,7.27,757.82,7.27,724.36c0-68.48,82.92-139.84,151.87-112.19,4.24,1.7,8.26,3.93,12.07,6.47,13.72,9.14,40.58,31.86,35.95,67.37,0,0,24.84-42.21-23.06-113.7-16.05-23.95-28.58-50.14-35.53-78.12-12.76-51.4-10.88-120.34,8.11-185.92,30.94-106.88,166.53-180.23,241.73-174.96,0,0-35,18.12-46.28,43.89,0,0,69.82-48.77,121.68-33.09Z"/><path fill="${e}" d="M637.78,601.36c-.68,0-1.35-.33-1.76-.94-.65-.97-.38-2.28.59-2.93,83.67-55.68,103.21-129.2,104.86-181.08,2.3-72.41-28.67-136.01-59-159.11-27.19-20.71-81.89-50.05-142.95-13.67-65.79,39.23-37.85,116.67-37.56,117.45.41,1.1-.15,2.3-1.24,2.72-1.07.38-2.3-.14-2.72-1.24-.31-.81-29.5-81.5,39.35-122.54,63.17-37.65,119.63-7.44,147.67,13.92,31.16,23.72,63.01,88.78,60.65,162.59-1.69,52.88-21.58,127.79-106.75,184.48-.36.23-.76.34-1.17.34Z"/><path fill="${c}" d="M772.84,784c-4.2,0-8.42-.34-12.63-1-11.24-1.81-21.87-5.82-31.62-11.95-.99-.63-1.28-1.93-.66-2.92s1.92-1.27,2.91-.67c9.26,5.83,19.36,9.66,30.04,11.35,25.68,4.15,51.91-5.19,70.24-24.79,18.04-19.3,25.42-45.64,19.76-70.46-3.31-14.52-6.95-26.24-23.77-44.96-33.67-37.51-106.14-31.48-146.84-15.19-13.5,5.38-82.11,31.43-106.95,15.42-.98-.64-1.26-1.95-.63-2.92.62-.98,1.93-1.28,2.92-.64,23.58,15.25,95.02-12.59,103.09-15.79,41.84-16.7,116.53-22.7,151.54,16.3,17.49,19.47,21.28,31.7,24.73,46.84,5.99,26.18-1.78,53.96-20.78,74.27-16.29,17.42-38.55,27.09-61.36,27.09Z"/>`,
  };
  return P[id] ?? P[0];
}

// ─── Front SVG builder ────────────────────────────────────────────────────────

function buildFrontSVG(clusters, bgColor, library, W, H) {
  const sc = H / 480;
  const parts = [];

  clusters.forEach((cl) => {
    const s = sc * cl.scale;
    const ox = cl.x * W;
    const oy = cl.y * H;
    cl.rings.forEach((r) => {
      const preset = library.find((p) => p.id === r.presetId);
      const rs = r.radius * s;
      const tileSize = Math.max(5, tangentSize(rs, r.count));
      const presetFit = preset ? presetFitScale(preset.layers) : 1;
      for (let mi = 0; mi < r.count; mi++) {
        const angle = (360 / r.count) * mi;
        const { x, y } = polar(rs, angle);
        const cx = ox + x,
          cy = oy + y;
        if (preset) {
          const tileX = cx - tileSize / 2;
          const tileY = cy - tileSize / 2;
          const half = tileSize / 2;
          preset.layers.forEach((layer) => {
            const sz = Math.max(
              4,
              Math.round(tileSize * 0.5 * layer.scale * presetFit),
            );
            const lx = half + layer.x * half * presetFit - sz / 2;
            const ly = half + layer.y * half * presetFit - sz / 2;
            const [la, lb, lc, ld, le] = layer.colors;
            const sc1000 = (sz / 1000).toFixed(6);
            parts.push(
              `<g transform="translate(${tileX.toFixed(2)},${tileY.toFixed(2)}) rotate(${angle.toFixed(2)},${half.toFixed(2)},${half.toFixed(2)})"><g transform="translate(${lx.toFixed(2)},${ly.toFixed(2)}) rotate(${layer.rotation.toFixed(2)},${(sz / 2).toFixed(2)},${(sz / 2).toFixed(2)}) scale(${sc1000})">${getInlineSVG(layer.motifId, la, lb, lc, ld, le)}</g></g>`,
            );
          });
        } else if (r.motifId !== undefined) {
          const [ra, rb, rc, rd, re] = r.colors ?? DEFAULT_COLORS;
          const sc1000 = (tileSize / 1000).toFixed(6);
          parts.push(
            `<g transform="translate(${(cx - tileSize / 2).toFixed(2)},${(cy - tileSize / 2).toFixed(2)}) rotate(${angle.toFixed(2)},${(tileSize / 2).toFixed(2)},${(tileSize / 2).toFixed(2)}) scale(${sc1000})">${getInlineSVG(r.motifId, ra, rb, rc, rd, re)}</g>`,
          );
        }
      }
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${bgColor}"/><rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="4" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>${parts.join("")}</svg>`;
}

// ─── Reverse SVG builder ──────────────────────────────────────────────────────

function buildReverseSVG(
  reverseRings,
  bgColor,
  library,
  T,
  W,
  H,
  template = "default",
) {
  const sc = H / 480; // ring scale — same reference as preview
  const layoutSc = H / 440; // layout scale — matches preview canvas height
  const pad = Math.round(H * 0.08);
  const padRight = Math.round(H * 0.07);
  const leftW = Math.round(W * 0.7); // note area
  const rightX = leftW; // right area starts here
  const rightW = W - leftW;

  const font = "DM Sans,Helvetica Neue,system-ui,sans-serif";
  const fsLabel = Math.round(8 * layoutSc); // small uppercase labels
  const fsBody = Math.round(9 * layoutSc); // branding line
  const fsTiny = Math.round(7 * layoutSc); // "To" label

  const brd = T.brd;
  const mut = T.mut;
  const dim = T.dim;
  const txt = T.txt;
  const gold = T.gold;

  const parts = [];

  // Background
  parts.push(`<rect width="${W}" height="${H}" fill="${bgColor}"/>`);

  // ── Note area ──
  const noteLabelY = pad + fsLabel;
  parts.push(
    `<text x="${pad}" y="${noteLabelY}" font-family="${font}" font-size="${fsLabel}" letter-spacing="${Math.round(fsLabel * 0.25)}" fill="${mut}">NOTE</text>`,
  );

  const noteLineStartY = noteLabelY + Math.round(16 * layoutSc);
  const noteLineGap = Math.round(18 * layoutSc) + 1;
  for (let i = 0; i < 5; i++) {
    const ly = noteLineStartY + i * noteLineGap;
    parts.push(
      `<line x1="${pad}" y1="${ly}" x2="${leftW - pad}" y2="${ly}" stroke="${brd}" stroke-width="1.5"/>`,
    );
  }

  // From label + line
  const fromLabelY = H - pad - Math.round(40 * layoutSc);
  parts.push(
    `<text x="${pad}" y="${fromLabelY}" font-family="${font}" font-size="${fsLabel}" letter-spacing="${Math.round(fsLabel * 0.2)}" fill="${mut}">FROM</text>`,
  );
  parts.push(
    `<line x1="${pad}" y1="${fromLabelY + Math.round(8 * layoutSc)}" x2="${leftW - pad}" y2="${fromLabelY + Math.round(8 * layoutSc)}" stroke="${brd}" stroke-width="1.5"/>`,
  );

  // Branding
  parts.push(
    `<text x="${pad}" y="${H - pad}" font-family="${font}" font-size="${fsBody}" letter-spacing="${Math.round(fsBody * 0.1)}" fill="${dim}">Patterns of Place · 2026</text>`,
  );

  // ── Address area ──
  // Stamp box
  const stampW = Math.round(44 * layoutSc);
  const stampH = Math.round(54 * layoutSc);
  const stampX = rightX + rightW - padRight - stampW;
  const stampY = padRight;
  parts.push(
    `<rect x="${stampX}" y="${stampY}" width="${stampW}" height="${stampH}" fill="none" stroke="${brd}" stroke-width="2" rx="4"/>`,
  );
  const innerSW = Math.round(28 * layoutSc),
    innerSH = Math.round(38 * layoutSc);
  parts.push(
    `<rect x="${stampX + (stampW - innerSW) / 2}" y="${stampY + (stampH - innerSH) / 2}" width="${innerSW}" height="${innerSH}" fill="${brd}" rx="2" opacity="0.6"/>`,
  );

  // To label
  const toLabelY = H - padRight - Math.round(100 * layoutSc);
  parts.push(
    `<text x="${rightX + padRight}" y="${toLabelY}" font-family="${font}" font-size="${fsTiny}" letter-spacing="${Math.round(fsTiny * 0.15)}" fill="${dim}">TO</text>`,
  );

  // Address lines
  const addrWidths = [0.9, 0.74, 0.74, 0.55];
  const addrAreaW = rightW - 2 * padRight;
  const addrGap = Math.round(18 * layoutSc);
  addrWidths.forEach((w, i) => {
    const ly = toLabelY + Math.round(addrGap * (i + 1));
    parts.push(
      `<line x1="${rightX + padRight}" y1="${ly}" x2="${rightX + padRight + addrAreaW * w}" y2="${ly}" stroke="${brd}" stroke-width="1.5"/>`,
    );
  });

  // ── Reverse rings ──
  reverseRings.forEach((ring) => {
    const preset = library.find((p) => p.id === ring.presetId);
    const rs = ring.radius * sc;
    const tileSize = Math.max(5, tangentSize(rs, ring.count));
    const presetFit = preset ? presetFitScale(preset.layers) : 1;
    const ox = ring.x * W;
    const oy = ring.y * H;

    for (let mi = 0; mi < ring.count; mi++) {
      const angle = (360 / ring.count) * mi;
      const { x, y } = polar(rs, angle);
      const cx = ox + x,
        cy = oy + y;

      if (preset) {
        const tileX = cx - tileSize / 2;
        const tileY = cy - tileSize / 2;
        const half = tileSize / 2;
        preset.layers.forEach((layer) => {
          const sz = Math.max(
            4,
            Math.round(tileSize * 0.5 * layer.scale * presetFit),
          );
          const lx = half + layer.x * half * presetFit - sz / 2;
          const ly = half + layer.y * half * presetFit - sz / 2;
          const [la, lb, lc, ld, le] = layer.colors;
          const sc1000 = (sz / 1000).toFixed(6);
          parts.push(
            `<g transform="translate(${tileX.toFixed(2)},${tileY.toFixed(2)}) rotate(${angle.toFixed(2)},${half.toFixed(2)},${half.toFixed(2)})"><g transform="translate(${lx.toFixed(2)},${ly.toFixed(2)}) rotate(${layer.rotation.toFixed(2)},${(sz / 2).toFixed(2)},${(sz / 2).toFixed(2)}) scale(${sc1000})">${getInlineSVG(layer.motifId, la, lb, lc, ld, le)}</g></g>`,
          );
        });
      } else if (ring.motifId !== undefined) {
        const [ra, rb, rc, rd, re] = ring.colors ?? DEFAULT_COLORS;
        const sc1000 = (tileSize / 1000).toFixed(6);
        parts.push(
          `<g transform="translate(${(cx - tileSize / 2).toFixed(2)},${(cy - tileSize / 2).toFixed(2)}) rotate(${angle.toFixed(2)},${(tileSize / 2).toFixed(2)},${(tileSize / 2).toFixed(2)}) scale(${sc1000})">${getInlineSVG(ring.motifId, ra, rb, rc, rd, re)}</g>`,
        );
      }
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join("")}</svg>`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const EXPORT_W = 1800;
const EXPORT_H = 1200;

/**
 * Returns download actions that always export both front and reverse.
 * Requires clusters/library for the front and reverseRings/T for the reverse.
 */
export function useExportArtwork({
  clusters,
  bgColor,
  library,
  reverseRings = [],
  T,
  template = "default",
}) {
  const getSvgPair = useCallback(() => {
    const frontSvg = buildFrontSVG(
      clusters,
      bgColor,
      library,
      EXPORT_W,
      EXPORT_H,
    );
    const reverseSvg = buildReverseSVG(
      reverseRings,
      bgColor,
      library,
      T,
      EXPORT_W,
      EXPORT_H,
      template,
    );
    return { frontSvg, reverseSvg };
  }, [clusters, bgColor, library, reverseRings, T, template]);

  const downloadSVG = useCallback(() => {
    const { frontSvg, reverseSvg } = getSvgPair();
    const frontBlob = new Blob([frontSvg], { type: "image/svg+xml" });
    const frontUrl = URL.createObjectURL(frontBlob);
    triggerDownload(frontUrl, "patterns-of-place-front.svg");
    URL.revokeObjectURL(frontUrl);

    // Small delay so the browser doesn't block the second download
    setTimeout(() => {
      const reverseBlob = new Blob([reverseSvg], { type: "image/svg+xml" });
      const reverseUrl = URL.createObjectURL(reverseBlob);
      triggerDownload(reverseUrl, "patterns-of-place-reverse.svg");
      URL.revokeObjectURL(reverseUrl);
    }, 400);
  }, [getSvgPair]);

  const downloadJPEG = useCallback(async () => {
    const { frontSvg, reverseSvg } = getSvgPair();
    // Front
    const frontCanvas = await svgStringToCanvas(
      frontSvg,
      EXPORT_W,
      EXPORT_H,
      bgColor,
    );
    if (!frontCanvas) throw new Error("Front canvas render failed");
    triggerDownload(
      frontCanvas.toDataURL("image/png", 0.95),
      "patterns-of-place-front.png",
    );

    // Give the browser a moment before triggering the second download
    await new Promise((r) => setTimeout(r, 400));

    // Reverse
    const reverseCanvas = await svgStringToCanvas(
      reverseSvg,
      EXPORT_W,
      EXPORT_H,
      bgColor,
    );
    if (!reverseCanvas) throw new Error("Reverse canvas render failed");
    triggerDownload(
      reverseCanvas.toDataURL("image/png", 0.95),
      "patterns-of-place-reverse.png",
    );
  }, [getSvgPair, bgColor]);

  return { downloadJPEG, downloadSVG, getSvgPair };
}
