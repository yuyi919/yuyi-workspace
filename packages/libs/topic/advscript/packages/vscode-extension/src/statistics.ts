/* eslint-disable no-prototype-builtins */
import { parseoutput, StructToken } from "./afterwriting-parser";
import { GeneratePdf } from "./pdf/pdf";
import { ExportConfig, CoreConfig } from "./configloader";
import { pdfstats } from "./pdf/pdfmaker";
import { calculateDialogueDuration, isMonologue, rgbToHex, wordToColor, median } from "./utils";
import readabilityScores = require("readability-scores");

type dialoguePiece = {
  character: string;
  speech: string;
};

interface dialoguePerCharacter {
  [x: string]: string[];
}

type dialogueStatisticPerCharacter = {
  name: string;
  speakingParts: number;
  wordsSpoken: number;
  secondsSpoken: number;
  averageComplexity: number;
  monologues: number;
  color: string;
};

type singleSceneStatistic = {
  title: string;
};

type lengthStatistics = {
  characters: number;
  characterswithoutwhitespace: number;
  lines: number;
  lineswithoutwhitespace: number;
  words: number;
  pages: number;
  pagesreal: number;
  scenes: number;
};

type lengthchartitem = {
  line: number;
  scene: string;
  length: number;
};

type dialoguechartitem = {
  line: number;
  scene: string;
  lengthTimeGlobal: number;
  lengthWordsGlobal: number;
  monologue: boolean;
  lengthTime: number;
  lengthWords: number;
};

type durationStatistics = {
  dialogue: number;
  action: number;
  total: number;
  lengthchart_action: lengthchartitem[];
  lengthchart_dialogue: lengthchartitem[];
  characters: dialoguechartitem[][];
  characternames: string[];
  monologues: number;
};

type characterStatistics = {
  characters: dialogueStatisticPerCharacter[];
  complexity: number;
  characterCount: number;
  monologues: number;
};

type sceneStatistics = {
  scenes: singleSceneStatistic[];
};

type screenPlayStatistics = {
  characterStats: characterStatistics;
  sceneStats: sceneStatistics;
  lengthStats: lengthStatistics;
  durationStats: durationStatistics;
  pdfmap: string;
  structure: StructToken[];
};

function age(value: number) {
  const max = 22;
  return value > max ? max : value;
}
function gradeToAge(grade: number) {
  return age(Math.round(grade + 5));
}

const createCharacterStatistics = (parsed: parseoutput): characterStatistics => {
  const dialoguePieces: dialoguePiece[] = [];
  for (let i = 0; i < parsed.tokens.length; i++) {
    while (i < parsed.tokens.length && parsed.tokens[i].type === "character") {
      const character = parsed.tokens[i].name();
      let speech = "";
      while (i++ && i < parsed.tokens.length) {
        if (parsed.tokens[i].type === "dialogue") {
          speech += parsed.tokens[i].text + " ";
        } else if (parsed.tokens[i].type === "character") {
          break;
        }
        // else skip extensions / parenthesis / dialogue-begin/-end
      }

      speech = speech.trim();
      dialoguePieces.push({
        character,
        speech,
      });
    }
  }

  const dialoguePerCharacter: dialoguePerCharacter = {};

  dialoguePieces.forEach((dialoguePiece) => {
    if (dialoguePerCharacter.hasOwnProperty(dialoguePiece.character)) {
      dialoguePerCharacter[dialoguePiece.character].push(dialoguePiece.speech);
    } else {
      dialoguePerCharacter[dialoguePiece.character] = [dialoguePiece.speech];
    }
  });

  const characterStats: dialogueStatisticPerCharacter[] = [];
  const speechcomplexityArray: number[] = [];
  let monologueCounter = 0;

  Object.keys(dialoguePerCharacter).forEach((singledialPerChar: string) => {
    const speakingParts = dialoguePerCharacter[singledialPerChar].length;
    let averageComplexity = 0;
    let secondsSpoken = 0;
    let monologues = 0;
    let combinedSentences = "";
    const allDialogueCombined = dialoguePerCharacter[singledialPerChar].reduce((prev, curr) => {
      const time = calculateDialogueDuration(curr);
      secondsSpoken += time;
      combinedSentences += "." + curr;
      if (isMonologue(time)) monologues++;
      return `${prev} ${curr} `;
    }, "");
    monologueCounter += monologues;
    const readability = readabilityScores(combinedSentences);
    if (readability) {
      averageComplexity =
        (gradeToAge(readability.daleChall) +
          gradeToAge(readability.ari) +
          gradeToAge(readability.colemanLiau) +
          gradeToAge(readability.fleschKincaid) +
          gradeToAge(readability.smog) +
          gradeToAge(readability.gunningFog)) /
        6;
      if (averageComplexity > 0) speechcomplexityArray.push(averageComplexity);
    }
    const wordsSpoken = getWordCount(allDialogueCombined);
    characterStats.push({
      name: singledialPerChar,
      color: rgbToHex(wordToColor(singledialPerChar, 0.6, 0.5)),
      speakingParts,
      secondsSpoken,
      averageComplexity,
      monologues,
      wordsSpoken,
    });
  });

  characterStats.sort((a, b) => {
    // by parts
    if (b.speakingParts > a.speakingParts) return +1;
    if (b.speakingParts < a.speakingParts) return -1;
    // then by words
    if (b.wordsSpoken > a.wordsSpoken) return +1;
    if (b.wordsSpoken < a.wordsSpoken) return -1;
    return 0;
  });

  return {
    characters: characterStats,
    complexity: median(speechcomplexityArray),
    characterCount: characterStats.length,
    monologues: monologueCounter,
  };
};

const createSceneStatistics = (parsed: parseoutput): sceneStatistics => {
  const sceneStats: singleSceneStatistic[] = [];
  parsed.tokens.forEach((tok) => {
    if (tok.type === "scene_heading") {
      sceneStats.push({
        title: tok.text,
      });
    }
  });
  return {
    scenes: sceneStats,
  };
};

const getLengthChart = (
  parsed: parseoutput
): {
  action: lengthchartitem[];
  dialogue: lengthchartitem[];
  characters: dialoguechartitem[][];
  characternames: string[];
  monologues: number;
} => {
  const action: lengthchartitem[] = [{ line: 0, length: 0, scene: undefined }];
  const dialogue: lengthchartitem[] = [{ line: 0, length: 0, scene: undefined }];
  const characters = new Map<string, dialoguechartitem[]>();
  let previousLengthAction = 0;
  let previousLengthDialogue = 0;
  let currentScene = "";
  let monologues = 0;
  parsed.tokens.forEach((element) => {
    if (element.type == "scene_heading") {
      currentScene = element.text;
    } else if (element.type == "action" || element.type == "dialogue") {
      const time = Number(element.time);
      if (!isNaN(time)) {
        if (element.type == "action") {
          previousLengthAction += Number(element.time);
        } else if (element.type == "dialogue") {
          previousLengthDialogue += Number(element.time);
        }
      }

      if (element.type == "action") {
        action.push({ line: element.line, length: previousLengthAction, scene: currentScene });
      } else if (element.type == "dialogue") {
        dialogue.push({ line: element.line, length: previousLengthDialogue, scene: currentScene });
        const currentCharacter = characters.get(element.character);
        let dialogueLength = 0;
        let wordsLength = 0;
        const wordcount = getWordCount(element.text);
        const time = Number(element.time);
        if (!currentCharacter) {
          characters.set(element.character, []);
        } else if (currentCharacter.length > 0) {
          dialogueLength = currentCharacter[currentCharacter.length - 1].lengthTimeGlobal;
          wordsLength = currentCharacter[currentCharacter.length - 1].lengthWordsGlobal;
        }
        let monologue = false;
        if (isMonologue(time)) {
          monologue = true;
          monologues++;
        }
        characters.get(element.character).push({
          line: element.line,
          lengthTime: element.time,
          lengthWords: wordcount,
          lengthTimeGlobal: dialogueLength + time,
          lengthWordsGlobal: wordsLength + wordcount,
          monologue: monologue, //monologue if dialogue is longer than 30 seconds
          scene: currentScene,
        });
      }
    }
  });
  const characterDuration: dialoguechartitem[][] = [];
  const characterNames: string[] = [];
  characters.forEach((value: dialoguechartitem[], key: string) => {
    characterNames.push(key);
    characterDuration.push(value);
  });
  return {
    action: action,
    dialogue: dialogue,
    characters: characterDuration,
    characternames: characterNames,
    monologues: monologues,
  };
};

const getWordCount = (script: string): number => {
  return ((script || "").match(/\S+/g) || []).length;
};
const getCharacterCount = (script: string): number => {
  return script.length;
};
const getCharacterCountWithoutWhitespace = (script: string): number => {
  return ((script || "").match(/\S+?/g) || []).length;
};
const getLineCount = (script: string): number => {
  return ((script || "").match(/\n/g) || []).length;
};
const getLineCountWithoutWhitespace = (script: string): number => {
  return ((script || "").match(/^.*\S.*$/gm) || []).length;
};

const createLengthStatistics = (
  script: string,
  pdf: pdfstats,
  parsed: parseoutput
): lengthStatistics => {
  return {
    characters: getCharacterCount(script),
    characterswithoutwhitespace: getCharacterCountWithoutWhitespace(script),
    lines: getLineCount(script),
    lineswithoutwhitespace: getLineCountWithoutWhitespace(script),
    words: getWordCount(script),
    pagesreal: pdf.pagecountReal,
    pages: pdf.pagecount,
    scenes: parsed.properties.scenes.length,
  };
};

const createDurationStatistics = (parsed: parseoutput): durationStatistics => {
  const lengthcharts = getLengthChart(parsed);
  console.log("Created duration stats");
  return {
    dialogue: parsed.lengthDialogue,
    action: parsed.lengthAction,
    total: parsed.lengthDialogue + parsed.lengthAction,
    lengthchart_action: lengthcharts.action,
    lengthchart_dialogue: lengthcharts.dialogue,
    characters: lengthcharts.characters,
    characternames: lengthcharts.characternames,
    monologues: lengthcharts.monologues,
  };
};

function mapToObject(map: any): any {
  const jsonObject: any = {};
  map.forEach((value: any, key: any) => {
    jsonObject[key] = value;
  });
  return jsonObject;
}

export const retrieveScreenPlayStatistics = async (
  script: string,
  parsed: parseoutput,
  config: CoreConfig,
  exportconfig: ExportConfig
): Promise<screenPlayStatistics> => {
  const pdfstats = await GeneratePdf("$STATS$", config, exportconfig, parsed, undefined);
  const pdfmap = mapToObject(pdfstats.linemap);
  return {
    characterStats: createCharacterStatistics(parsed),
    sceneStats: createSceneStatistics(parsed),
    lengthStats: createLengthStatistics(script, pdfstats, parsed),
    durationStats: createDurationStatistics(parsed),
    pdfmap: JSON.stringify(pdfmap),
    structure: parsed.properties.structure,
  };
};
