/* eslint-disable @typescript-eslint/no-var-requires */
import * as vscode from "vscode";

//var syllable = require('syllable');

/**
 * Trims character extensions, for example the parantheses part in `JOE (on the radio)`
 */
export const trimCharacterExtension = (character: string): string =>
  character.replace(/[ \t]*(\(.*\))[ \t]*([ \t]*\^)?$/, "");

/**
 * Trims the `@` symbol necesary in character names if they contain lower-case letters, i.e. `@McCONNOR`
 */
export const trimCharacterForceSymbol = (character: string): string =>
  character.replace(/^[ \t]*@/, "");

/**
 * Character names containing lowercase letters need to be prefixed with an `@` symbol
 */
// export const addForceSymbolToCharacter = (characterName: string): string => {
//   const containsLowerCase = (text: string): boolean => /[\p{Ll}]/u.test(text);
//   return containsLowerCase(characterName) ? `@${characterName}` : characterName;
// };
export const addForceSymbolToCharacter = (characterName: string): string => {
  return /[A-Z]+/u.test(characterName) ? characterName : `@${characterName}`;
};

export const getCharactersWhoSpokeBeforeLast = (parsedDocument: any, position: vscode.Position) => {
  let searchIndex = 0;
  if (parsedDocument.tokenLines[position.line - 1]) {
    searchIndex = parsedDocument.tokenLines[position.line - 1];
  }
  let stopSearch = false;
  const previousCharacters: string[] = [];
  let lastCharacter = undefined;
  while (searchIndex > 0 && !stopSearch) {
    const token = parsedDocument.tokens[searchIndex - 1];
    if (token.type == "character") {
      const name = trimCharacterForceSymbol(trimCharacterExtension(token.text)).trim();
      if (lastCharacter == undefined) {
        lastCharacter = name;
      } else if (name != lastCharacter && previousCharacters.indexOf(name) == -1) {
        previousCharacters.push(name);
      }
    } else if (token.type == "scene_heading") {
      stopSearch = true;
    }
    searchIndex--;
  }
  if (lastCharacter != undefined) previousCharacters.push(lastCharacter);
  return previousCharacters;
};

/**
 * Calculate an approximation of how long a line of dialogue would take to say
 */
export const calculateDialogueDuration = (dialogue: string): number => {
  let duration = 0;

  //According to this paper: http://www.office.usp.ac.jp/~klinger.w/2010-An-Analysis-of-Articulation-Rates-in-Movies.pdf
  //The average amount of syllables per second in the 14 movies analysed is 5.13994 (0.1945548s/syllable)
  const sanitized = dialogue.replace(/[^\w]/gi, "");
  duration += (sanitized.length / 3) * 0.1945548;
  //duration += syllable(dialogue)*0.1945548;

  //According to a very crude analysis involving watching random movie scenes on youtube and measuring pauses with a stopwatch
  //A comma in the middle of a sentence adds 0.4sec and a full stop/excalmation/question mark adds 0.8 sec.
  const punctuationMatches = dialogue.match(/(\.|\?|!|:) |(, )/g);
  if (punctuationMatches) {
    if (punctuationMatches[0]) duration += 0.75 * punctuationMatches[0].length;
    if (punctuationMatches[1]) duration += 0.3 * punctuationMatches[1].length;
  }
  return duration;
};

export const last = function (array: any[]): any {
  return array[array.length - 1];
};
