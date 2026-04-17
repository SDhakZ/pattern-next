import { usePatternsOfPlace } from "../../app/PatternsOfPlaceProvider.jsx";
import { SET_STAGE } from "../../app/actions.js";
import bg from "../../../../assets/bg.png";

const STEPS = [
  {
    title: "1. Pick Your Composition",
    description: "Choose the base structure for your composition.",
  },
  {
    title: "2. Design Your Pattern",
    description:
      "Customize your rings and clusters in the Ring Studio, or craft original compositions by combining traditional motifs in the Pattern Lab.",
  },
  {
    title: "3. Collect Your Keepsake",
    description: "Finalize and scan QR from your phone to save your keepsake.",
  },
];

export function StageInstruction() {
  const { dispatch } = usePatternsOfPlace();
  const bgSrc = typeof bg === "string" ? bg : bg?.src;

  const next = () => dispatch({ type: SET_STAGE, stage: 1 });
  const previous = () => dispatch({ type: SET_STAGE, stage: 0 });

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-6 py-10"
      style={{ backgroundImage: `url(${bgSrc})` }}
    >
      <div className="grid w-[min(95vw,1240px)] grid-cols-3 overflow-hidden rounded border border-[rgba(184,137,18,0.62)] bg-[rgba(5,6,10,0.7)] shadow-[0_0_0_1px_rgba(20,12,0,0.4),0_20px_50px_rgba(0,0,0,0.45)] max-[980px]:grid-cols-1">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="relative flex min-h-60 flex-col items-center justify-center px-10 pb-8 pt-10 text-center max-[980px]:min-h-52"
          >
            {index > 0 && (
              <span className="absolute left-0 top-7 h-[calc(100%-56px)] w-px bg-[rgba(128,89,0,1)] max-[980px]:left-10 max-[980px]:top-0 max-[980px]:h-px max-[980px]:w-[calc(100%-80px)]" />
            )}

            <h2 className="flex min-h-[2.35em] w-full items-center justify-center text-balance text-[clamp(20px,1.65vw,24px)] font-semibold leading-[1.1] text-[#f2e8d3] font-['Crimson_Pro','Cormorant_Garamond',Georgia,serif] wrap-anywhere">
              {step.title}
            </h2>

            <p className="mt-5 min-h-[5em] max-w-80 text-balance text-[clamp(15px,1.06vw,20px)] font-medium leading-[1.18] text-[rgba(230,187,69,1)] font-['Outfit','DM_Sans',system-ui,sans-serif]">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-14 flex gap-6">
        <button
          className="min-h-12 min-w-36 cursor-pointer rounded-full border border-[rgba(184,137,18,0.9)] bg-[rgba(3,7,16,0.88)] px-8 py-2.5 text-2xl font-bold uppercase tracking-[0.05em] text-[#d7b450] font-['Outfit','DM_Sans',system-ui,sans-serif] shadow-[0_0_0_1px_rgba(184,137,18,0.16),0_0_18px_rgba(184,137,18,0.3),inset_0_-8px_16px_rgba(0,0,0,0.44)]"
          onClick={previous}
        >
          Previous
        </button>
        <button
          className="min-h-12 min-w-36 cursor-pointer rounded-full border border-[rgba(184,137,18,0.9)] bg-[rgba(3,7,16,0.88)] px-8 py-2.5 text-2xl font-bold uppercase tracking-[0.05em] text-[#d7b450] font-['Outfit','DM_Sans',system-ui,sans-serif] shadow-[0_0_0_1px_rgba(184,137,18,0.16),0_0_18px_rgba(184,137,18,0.3),inset_0_-8px_16px_rgba(0,0,0,0.44)]"
          onClick={next}
        >
          Next
        </button>
      </div>
    </div>
  );
}
