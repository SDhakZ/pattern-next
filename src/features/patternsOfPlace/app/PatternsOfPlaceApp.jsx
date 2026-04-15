import {
  PatternsOfPlaceProvider,
  usePatternsOfPlace,
} from "./PatternsOfPlaceProvider.jsx";
import { selectStage } from "./selectors.js";
import { StageSplash } from "../components/stageSplash/StageSplash.jsx";
import { StageTemplatePicker } from "../components/stageTemplatePicker/StageTemplatePicker.jsx";
import { StageStudio } from "../components/stageStudio/StageStudio.jsx";
import { StagePatternLab } from "../components/stagePatternLab/StagePatternLab.jsx";
import { StageFinalize } from "../components/stageFinalize/StageFinalize.jsx";

const STAGES = [
  StageSplash,
  StageTemplatePicker,
  StageStudio,
  StagePatternLab,
  StageFinalize,
];

function StageRouter() {
  const { state } = usePatternsOfPlace();
  const stage = selectStage(state);
  const Stage = STAGES[stage];
  return Stage ? <Stage /> : null;
}

export function PatternsOfPlaceApp() {
  return (
    <PatternsOfPlaceProvider>
      <StageRouter />
    </PatternsOfPlaceProvider>
  );
}
