import { Config } from "./voiceroid";
import * as fs from "fs";
import * as path from "path";
import { Ebyroid } from "./main";
import { WaveFile } from "wavefile";

test("test", async () => {
  const a = new Config("kiri", "E:\\AHS\\VOICEROID2", "akari_44", {
    volume: 4,
  });
  const b = new Config("akarin", "E:\\AHS\\VOICEROID2", "akari_44");
  const ebyroid = new Ebyroid(a, b);
  ebyroid.use("kiri");

  const waveObject = await ebyroid.convert(
    "私がシュリンプちゃんです。またの名を海老といいます。伊勢海老じゃないよ"
  );
  const wav = new WaveFile();
  wav.fromScratch(1, waveObject.sampleRate, "16", waveObject.data);
  const oho = (Math.random() * 100) | 0;
  fs.writeFileSync(path.join(__dirname, `TEST${oho}.wav`), wav.toBuffer());
});
