/* eslint-disable no-console */
const fs = require("fs");
const { WaveFile } = require("wavefile");
const { Ebyroid, Config } = require("../dist")

const a = new Config("kiri", "E:\\AHS\\VOICEROID2", "akari_44", {
  volume: 4,
});
const b = new Config("akarin", "E:\\AHS\\VOICEROID2", "akari_44");
const ebyroid = new Ebyroid(a, b);
ebyroid.use("kiri");

async function main() {
  const waveObject = await ebyroid.convert(
    "私がシュリンプちゃんです。またの名を海老といいます。伊勢海老じゃないよ"
  );
  const wav = new WaveFile();
  wav.fromScratch(1, waveObject.sampleRate, "16", waveObject.data);
  const oho = (Math.random() * 100) | 0;
  fs.writeFileSync(`TEST${oho}.wav`, wav.toBuffer());
}
main();
