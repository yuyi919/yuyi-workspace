import * as MZ from "../core";
import { Graphics, Utils } from "../dom";
import {
  Game_Actors,
  Game_Map,
  Game_Message,
  Game_Party,
  Game_Player,
  Game_Screen,
  Game_SelfSwitches,
  Game_Switches,
  Game_System,
  Game_Temp,
  Game_Timer,
  Game_Troop,
  Game_Variables,
} from "../game";
import { BattleManager } from "./battle";
import { ImageManager } from "./image";
import { StorageManager } from "./storage";

type SaveContents = {
  system: Game_System;
  screen: Game_Screen;
  timer: Game_Timer;
  switches: Game_Switches;
  variables: Game_Variables;
  selfSwitches: Game_SelfSwitches;
  actors: Game_Actors;
  party: Game_Party;
  map: Game_Map;
  player: Game_Player;
};

type XhrError = {
  name: string;
  src: string;
  url: string;
};

type LoadedObject = {
  // only MapXXX.json object has these props
  data?: Array<number>;
  events?: LoadedObject;
  meta?: { [key: string]: any };
  note?: string;
};

export let $dataActors: MZ.DataActor[];
export let $dataClasses: MZ.DataClass[];
export let $dataSkills: MZ.DataSkill[];
export let $dataItems: MZ.DataItem[];
export let $dataWeapons: MZ.DataWeapon[];
export let $dataArmors: MZ.DataArmor[];
export let $dataEnemies: MZ.DataEnemy[];
export let $dataTroops: MZ.DataTroop[];
export let $dataStates: MZ.DataState[];
export let $dataAnimations: MZ.DataAnimation[];
export let $dataTilesets: MZ.DataTileset[];
export let $dataCommonEvents: MZ.DataCommonEvent[];
export let $dataSystem: MZ.DataSystem;
export let $dataMapInfos: MZ.DataMapInfo[];
export let $dataMap: MZ.DataMap;
export let $gameTemp: Game_Temp;
export let $gameSystem: Game_System;
export let $gameScreen: Game_Screen;
export let $gameTimer: Game_Timer;
export let $gameMessage: Game_Message;
export let $gameSwitches: Game_Switches;
export let $gameVariables: Game_Variables;
export let $gameSelfSwitches: Game_SelfSwitches;
export let $gameActors: Game_Actors;
export let $gameParty: Game_Party;
export let $gameTroop: Game_Troop;
export let $gameMap: Game_Map;
export let $gamePlayer: Game_Player;
export let $testEvent: MZ.EventCommand[];

// FIXME: any trick to do this like Reflection?
function setModuleVars(name: string, value: any): void {
  (window as any)[name] = value;
  switch (name) {
    case "$dataActors":
      $dataActors = value;
      break;
    case "$dataClasses":
      $dataClasses = value;
      break;
    case "$dataSkills":
      $dataSkills = value;
      break;
    case "$dataItems":
      $dataItems = value;
      break;
    case "$dataWeapons":
      $dataWeapons = value;
      break;
    case "$dataArmors":
      $dataArmors = value;
      break;
    case "$dataEnemies":
      $dataEnemies = value;
      break;
    case "$dataTroops":
      $dataTroops = value;
      break;
    case "$dataStates":
      $dataStates = value;
      break;
    case "$dataAnimations":
      $dataAnimations = value;
      break;
    case "$dataTilesets":
      $dataTilesets = value;
      break;
    case "$dataCommonEvents":
      $dataCommonEvents = value;
      break;
    case "$dataSystem":
      $dataSystem = value;
      break;
    case "$dataMapInfos":
      $dataMapInfos = value;
      break;
    case "$dataMap":
      $dataMap = value;
      break;
    case "$gameTemp":
      $gameTemp = value;
      break;
    case "$gameSystem":
      $gameSystem = value;
      break;
    case "$gameScreen":
      $gameScreen = value;
      break;
    case "$gameTimer":
      $gameTimer = value;
      break;
    case "$gameMessage":
      $gameMessage = value;
      break;
    case "$gameSwitches":
      $gameSwitches = value;
      break;
    case "$gameVariables":
      $gameVariables = value;
      break;
    case "$gameSelfSwitches":
      $gameSelfSwitches = value;
      break;
    case "$gameActors":
      $gameActors = value;
      break;
    case "$gameParty":
      $gameParty = value;
      break;
    case "$gameTroop":
      $gameTroop = value;
      break;
    case "$gameMap":
      $gameMap = value;
      break;
    case "$gamePlayer":
      $gamePlayer = value;
      break;
    case "$testEvent":
      $testEvent = value;
      break;
    default:
      throw new Error("unknown global variables: " + name);
  }
}
function getModuleVars(name: string): any {
  switch (name) {
    case "$dataActors":
      return $dataActors;
    case "$dataClasses":
      return $dataClasses;
    case "$dataSkills":
      return $dataSkills;
    case "$dataItems":
      return $dataItems;
    case "$dataWeapons":
      return $dataWeapons;
    case "$dataArmors":
      return $dataArmors;
    case "$dataEnemies":
      return $dataEnemies;
    case "$dataTroops":
      return $dataTroops;
    case "$dataStates":
      return $dataStates;
    case "$dataAnimations":
      return $dataAnimations;
    case "$dataTilesets":
      return $dataTilesets;
    case "$dataCommonEvents":
      return $dataCommonEvents;
    case "$dataSystem":
      return $dataSystem;
    case "$dataMapInfos":
      return $dataMapInfos;
    case "$dataMap":
      return $dataMap;
    case "$gameTemp":
      return $gameTemp;
    case "$gameSystem":
      return $gameSystem;
    case "$gameScreen":
      return $gameScreen;
    case "$gameTimer":
      return $gameTimer;
    case "$gameMessage":
      return $gameMessage;
    case "$gameSwitches":
      return $gameSwitches;
    case "$gameVariables":
      return $gameVariables;
    case "$gameSelfSwitches":
      return $gameSelfSwitches;
    case "$gameActors":
      return $gameActors;
    case "$gameParty":
      return $gameParty;
    case "$gameTroop":
      return $gameTroop;
    case "$gameMap":
      return $gameMap;
    case "$gamePlayer":
      return $gamePlayer;
    case "$testEvent":
      return $testEvent;
    default:
      throw new Error("unknown global variables: " + name);
  }
}

//-----------------------------------------------------------------------------
// DataManager
//
// The static class that manages the database and game objects.

export class DataManager {
  static _globalInfo: Array<MZ.SaveFileInfo> | null = null;
  static _errors: Array<XhrError> = [];

  static _databaseFiles = [
    { name: "$dataActors", src: "Actors.json" },
    { name: "$dataClasses", src: "Classes.json" },
    { name: "$dataSkills", src: "Skills.json" },
    { name: "$dataItems", src: "Items.json" },
    { name: "$dataWeapons", src: "Weapons.json" },
    { name: "$dataArmors", src: "Armors.json" },
    { name: "$dataEnemies", src: "Enemies.json" },
    { name: "$dataTroops", src: "Troops.json" },
    { name: "$dataStates", src: "States.json" },
    { name: "$dataAnimations", src: "Animations.json" },
    { name: "$dataTilesets", src: "Tilesets.json" },
    { name: "$dataCommonEvents", src: "CommonEvents.json" },
    { name: "$dataSystem", src: "System.json" },
    { name: "$dataMapInfos", src: "MapInfos.json" },
  ];

  static loadGlobalInfo(): void {
    StorageManager.loadObject("global")
      .then((globalInfo: object) => {
        this._globalInfo = globalInfo as MZ.SaveFileInfo[];
        this.removeInvalidGlobalInfo();
        return 0;
      })
      .catch(() => {
        this._globalInfo = [];
      });
  }

  static removeInvalidGlobalInfo(): void {
    const globalInfo = this._globalInfo;
    for (const info of globalInfo!) {
      const savefileId = globalInfo!.indexOf(info);
      if (!this.savefileExists(savefileId)) {
        delete globalInfo![savefileId];
      }
    }
  }

  static saveGlobalInfo(): void {
    StorageManager.saveObject("global", this._globalInfo!);
  }

  static isGlobalInfoLoaded(): boolean {
    return !!this._globalInfo;
  }

  static loadDatabase(): void {
    const test = this.isBattleTest() || this.isEventTest();
    const prefix = test ? "Test_" : "";
    for (const databaseFile of this._databaseFiles) {
      this.loadDataFile(databaseFile.name, prefix + databaseFile.src);
    }
    if (this.isEventTest()) {
      this.loadDataFile("$testEvent", prefix + "Event.json");
    }
  }

  static loadDataFile(name: string, src: string): void {
    const xhr = new XMLHttpRequest();
    const url = "data/" + src;
    setModuleVars(name, null);
    xhr.open("GET", url);
    xhr.overrideMimeType("application/json");
    xhr.onload = () => this.onXhrLoad(xhr, name, src, url);
    xhr.onerror = () => this.onXhrError(name, src, url);
    xhr.send();
  }

  static onXhrLoad(xhr: XMLHttpRequest, name: string, src: string, url: string): void {
    if (xhr.status < 400) {
      setModuleVars(name, JSON.parse(xhr.responseText));
      this.onLoad(getModuleVars(name));
    } else {
      this.onXhrError(name, src, url);
    }
  }

  static onXhrError(name: string, src: string, url: string): void {
    const error: XhrError = { name: name, src: src, url: url };
    this._errors.push(error);
  }

  static isDatabaseLoaded(): boolean {
    this.checkError();
    for (const databaseFile of this._databaseFiles) {
      if (!getModuleVars(databaseFile.name)) {
        return false;
      }
    }
    return true;
  }

  static loadMapData(mapId: number): void {
    if (mapId > 0) {
      const filename = "Map%1.json".format(mapId.padZero(3));
      this.loadDataFile("$dataMap", filename);
    } else {
      this.makeEmptyMap();
    }
  }

  static makeEmptyMap(): void {
    $dataMap = {} as MZ.DataMap;
    $dataMap.data = [];
    $dataMap.events = [];
    $dataMap.width = 100;
    $dataMap.height = 100;
    $dataMap.scrollType = 3;
  }

  static isMapLoaded(): boolean {
    this.checkError();
    return !!$dataMap;
  }

  static onLoad(object: LoadedObject): void {
    if (this.isMapObject(object)) {
      this.extractMetadata(object);
      this.extractArrayMetadata(object.events!);
    } else {
      this.extractArrayMetadata(object);
    }
  }

  static isMapObject(object: LoadedObject): boolean {
    return !!(object.data && object.events);
  }

  static extractArrayMetadata(array: LoadedObject): void {
    if (Array.isArray(array)) {
      for (const data of array) {
        if (data && "note" in data) {
          this.extractMetadata(data);
        }
      }
    }
  }

  static extractMetadata(data: LoadedObject): void {
    const regExp = /<([^<>:]+)(:?)([^>]*)>/g;
    data.meta = {};
    for (;;) {
      const match = regExp.exec(data.note!);
      if (match) {
        if (match[2] === ":") {
          data.meta[match[1]] = match[3];
        } else {
          data.meta[match[1]] = true;
        }
      } else {
        break;
      }
    }
  }

  static checkError(): void {
    if (this._errors.length > 0) {
      const error = this._errors.shift();
      const retry = () => {
        this.loadDataFile(error!.name, error!.src);
      };
      throw ["LoadError", error!.url, retry];
    }
  }

  static isBattleTest(): boolean {
    return Utils.isOptionValid("btest");
  }

  static isEventTest(): boolean {
    return Utils.isOptionValid("etest");
  }

  static isSkill(item: MZ.DataItemBase | null): boolean {
    return !!item && $dataSkills.includes(item as MZ.DataSkill);
  }

  static isItem(item: MZ.DataItemBase | null): boolean {
    return !!item && $dataItems.includes(item as MZ.DataItem);
  }

  static isWeapon(item: MZ.DataItemBase | null): boolean {
    return !!item && $dataWeapons.includes(item as MZ.DataWeapon);
  }

  static isArmor(item: MZ.DataItemBase | null): boolean {
    return !!item && $dataArmors.includes(item as MZ.DataArmor);
  }

  static createGameObjects(): void {
    setModuleVars("$gameTemp", new Game_Temp());
    setModuleVars("$gameSystem", new Game_System());
    setModuleVars("$gameScreen", new Game_Screen());
    setModuleVars("$gameTimer", new Game_Timer());
    setModuleVars("$gameMessage", new Game_Message());
    setModuleVars("$gameSwitches", new Game_Switches());
    setModuleVars("$gameVariables", new Game_Variables());
    setModuleVars("$gameSelfSwitches", new Game_SelfSwitches());
    setModuleVars("$gameActors", new Game_Actors());
    setModuleVars("$gameParty", new Game_Party());
    setModuleVars("$gameTroop", new Game_Troop());
    setModuleVars("$gameMap", new Game_Map());
    setModuleVars("$gamePlayer", new Game_Player());
  }

  static setupNewGame(): void {
    this.createGameObjects();
    this.selectSavefileForNewGame();
    $gameParty.setupStartingMembers();
    $gamePlayer.setupForNewGame();
    Graphics.frameCount = 0;
  }

  static setupBattleTest(): void {
    this.createGameObjects();
    $gameParty.setupBattleTest();
    BattleManager.setup($dataSystem.testTroopId, true, false);
    BattleManager.setBattleTest(true);
    BattleManager.playBattleBgm();
  }

  static setupEventTest(): void {
    this.createGameObjects();
    this.selectSavefileForNewGame();
    $gameParty.setupStartingMembers();
    $gamePlayer.reserveTransfer(-1, 8, 6);
    $gamePlayer.setTransparent(false);
  }

  static isAnySavefileExists(): boolean {
    return this._globalInfo!.some((x) => x);
  }

  static latestSavefileId(): number {
    const globalInfo = this._globalInfo;
    const validInfo = globalInfo!.slice(1).filter((x) => x);
    const latest = Math.max(...validInfo.map((x) => x.timestamp));
    const index = globalInfo!.findIndex((x) => x && x.timestamp === latest);
    return index > 0 ? index : 0;
  }

  static earliestSavefileId(): number {
    const globalInfo = this._globalInfo;
    const validInfo = globalInfo!.slice(1).filter((x) => x);
    const earliest = Math.min(...validInfo.map((x) => x.timestamp));
    const index = globalInfo!.findIndex((x) => x && x.timestamp === earliest);
    return index > 0 ? index : 0;
  }

  static emptySavefileId(): number {
    const globalInfo = this._globalInfo;
    const maxSavefiles = this.maxSavefiles();
    if (globalInfo!.length < maxSavefiles) {
      return Math.max(1, globalInfo!.length);
    } else {
      const index = globalInfo!.slice(1).findIndex((x) => !x);
      return index >= 0 ? index + 1 : -1;
    }
  }

  static loadAllSavefileImages(): void {
    for (const info of this._globalInfo!.filter((x) => x)) {
      this.loadSavefileImages(info);
    }
  }

  static loadSavefileImages(info: MZ.SaveFileInfo): void {
    if (info.characters && Symbol.iterator in info.characters) {
      for (const character of info.characters) {
        ImageManager.loadCharacter(character[0]);
      }
    }
    if (info.faces && Symbol.iterator in info.faces) {
      for (const face of info.faces) {
        ImageManager.loadFace(face[0]);
      }
    }
  }

  static maxSavefiles(): number {
    return 20;
  }

  static savefileInfo(savefileId: number): MZ.SaveFileInfo | null {
    const globalInfo = this._globalInfo;
    return globalInfo![savefileId] ? globalInfo![savefileId] : null;
  }

  static savefileExists(savefileId: number): boolean {
    const saveName = this.makeSavename(savefileId);
    return StorageManager.exists(saveName);
  }

  static saveGame(savefileId: number): Promise<number> {
    const contents = this.makeSaveContents();
    const saveName = this.makeSavename(savefileId);
    return StorageManager.saveObject(saveName, contents).then(() => {
      this._globalInfo![savefileId] = this.makeSavefileInfo();
      this.saveGlobalInfo();
      return 0;
    });
  }

  static loadGame(savefileId: number): Promise<number> {
    const saveName = this.makeSavename(savefileId);
    return StorageManager.loadObject(saveName).then((contents: object) => {
      this.createGameObjects();
      this.extractSaveContents(contents as SaveContents);
      this.correctDataErrors();
      return 0;
    });
  }

  static makeSavename(savefileId: number): string {
    return "file%1".format(savefileId);
  }

  static selectSavefileForNewGame(): void {
    const emptySavefileId = this.emptySavefileId();
    const earliestSavefileId = this.earliestSavefileId();
    if (emptySavefileId > 0) {
      $gameSystem.setSavefileId(emptySavefileId);
    } else {
      $gameSystem.setSavefileId(earliestSavefileId);
    }
  }

  static makeSavefileInfo(): MZ.SaveFileInfo {
    const info: MZ.SaveFileInfo = {} as MZ.SaveFileInfo;
    info.title = $dataSystem.gameTitle;
    info.characters = $gameParty.charactersForSavefile();
    info.faces = $gameParty.facesForSavefile();
    info.playtime = $gameSystem.playtimeText();
    info.timestamp = Date.now();
    return info;
  }

  static makeSaveContents(): SaveContents {
    // A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
    const contents: SaveContents = {} as SaveContents;
    contents.system = $gameSystem;
    contents.screen = $gameScreen;
    contents.timer = $gameTimer;
    contents.switches = $gameSwitches;
    contents.variables = $gameVariables;
    contents.selfSwitches = $gameSelfSwitches;
    contents.actors = $gameActors;
    contents.party = $gameParty;
    contents.map = $gameMap;
    contents.player = $gamePlayer;
    return contents;
  }

  static extractSaveContents(contents: SaveContents): void {
    setModuleVars("$gameSystem", contents.system);
    setModuleVars("$gameScreen", contents.screen);
    setModuleVars("$gameTimer", contents.timer);
    setModuleVars("$gameSwitches", contents.switches);
    setModuleVars("$gameVariables", contents.variables);
    setModuleVars("$gameSelfSwitches", contents.selfSwitches);
    setModuleVars("$gameActors", contents.actors);
    setModuleVars("$gameParty", contents.party);
    setModuleVars("$gameMap", contents.map);
    setModuleVars("$gamePlayer", contents.player);
  }

  static correctDataErrors(): void {
    $gameParty.removeInvalidMembers();
  }
}
