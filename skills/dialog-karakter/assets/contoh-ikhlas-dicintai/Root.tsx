import { Composition } from "remotion";
import { IkhlasDicintai } from "./Video";
import cues from "../public/cues.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="IkhlasDicintai"
      component={IkhlasDicintai}
      durationInFrames={Math.ceil(cues.duration * 30)}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
