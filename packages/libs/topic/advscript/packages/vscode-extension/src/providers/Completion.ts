import * as vscode from "vscode";
import { parsedDocuments } from "../extension";
import { getCharactersWhoSpokeBeforeLast, addForceSymbolToCharacter } from "../utils";
import username = require("username");
let fontnames: any[];
const fontFinder = require("font-finder");
let userfullname: string;

//Load fonts for autocomplete
(async () => {
  const fontlist = await fontFinder.list();
  fontnames = Object.keys(fontlist);
})();

//Get user's full name for author autocomplete
(async () => {
  userfullname = await username();
  if (userfullname.length > 0) {
    userfullname = userfullname.charAt(0).toUpperCase() + userfullname.slice(1);
  }
})();

function TimeofDayCompletion(
  input: string,
  addspace: boolean,
  sort: string
): vscode.CompletionItem {
  return {
    label: " - " + input,
    kind: vscode.CompletionItemKind.Constant,
    filterText: "- " + input,
    sortText: sort,
    insertText: (addspace ? " " : "") + input + "\n\n",
  };
}
function TitlePageKey(
  input: string,
  sort: string,
  description?: string,
  triggerIntellisense?: boolean
): vscode.CompletionItem {
  if (triggerIntellisense) {
    return {
      label: input + ": ",
      kind: vscode.CompletionItemKind.Constant,
      filterText: "\n" + input,
      sortText: sort.toString(),
      documentation: description,
      command: { command: "editor.action.triggerSuggest", title: "triggersuggest" },
    };
  }
  return {
    label: input + ": ",
    kind: vscode.CompletionItemKind.Constant,
    filterText: "\n" + input,
    sortText: sort.toString(),
    documentation: description,
  };
}

export class CompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position /* token: CancellationToken, context: CompletionContext*/
  ): vscode.CompletionItem[] {
    const completes: vscode.CompletionItem[] = [];
    const parsedDocument = parsedDocuments.get(document.uri.toString());
    const currentline = document.getText(
      new vscode.Range(new vscode.Position(position.line, 0), position)
    );
    const prevLine = document
      .getText(new vscode.Range(new vscode.Position(position.line - 1, 0), position))
      .trimRight();
    const hasCharacters = parsedDocument.properties.characters.size > 0;
    const currentLineIsEmpty = currentline === "";
    const previousLineIsEmpty = prevLine === "";

    //Title page autocomplete
    if (parsedDocument.properties.firstTokenLine > position.line) {
      if (currentline.indexOf(":") == -1) {
        if (parsedDocument.properties.titleKeys.indexOf("title") == -1)
          completes.push(TitlePageKey("Title", "A", "The title of the screenplay"));
        if (parsedDocument.properties.titleKeys.indexOf("credit") == -1)
          completes.push(TitlePageKey("Credit", "B", "How the author is credited", true));
        if (parsedDocument.properties.titleKeys.indexOf("author") == -1)
          completes.push(TitlePageKey("Author", "C", "The name of the author (you!)", true));
        if (parsedDocument.properties.titleKeys.indexOf("source") == -1)
          completes.push(
            TitlePageKey(
              "Source",
              "D",
              "An additional source, such as the author of the original story",
              true
            )
          );
        if (parsedDocument.properties.titleKeys.indexOf("notes") == -1)
          completes.push(TitlePageKey("Notes", "E", "Additional notes"));
        if (parsedDocument.properties.titleKeys.indexOf("draft_date") == -1)
          completes.push(TitlePageKey("Draft date", "F", "The date of the current draft", true));
        if (parsedDocument.properties.titleKeys.indexOf("date") == -1)
          completes.push(TitlePageKey("Date", "G", "The date of the screenplay", true));
        if (
          parsedDocument.properties.titleKeys.indexOf("contact") == -1 ||
          parsedDocument.properties.titleKeys.indexOf("contact_info") == -1
        )
          completes.push(
            TitlePageKey("Contact", "H", "Contact details of the author or production company")
          );
        if (parsedDocument.properties.titleKeys.indexOf("copyright") == -1)
          completes.push(TitlePageKey("Copyright", "I", "Copyright information", true));
        if (parsedDocument.properties.titleKeys.indexOf("watermark") == -1)
          completes.push(
            TitlePageKey(
              "Watermark",
              "J",
              "A watermark to be displayed across every page of the PDF"
            )
          );
        if (parsedDocument.properties.titleKeys.indexOf("font") == -1)
          completes.push(
            TitlePageKey("Font", "K", "The font to be used in the preview and in the PDF", true)
          );
        if (parsedDocument.properties.titleKeys.indexOf("revision") == -1)
          completes.push(
            TitlePageKey("Revision", "L", "The name of the revision (ex: 'Second Draft')", true)
          );
      } else {
        const currentkey = currentline.trimRight().toLowerCase();
        if (currentkey == "date:" || currentkey == "draft date:") {
          const datestring1 = new Date().toLocaleDateString();
          const datestring2 = new Date().toDateString();
          completes.push({
            label: datestring1,
            insertText: datestring1 + "\n",
            kind: vscode.CompletionItemKind.Text,
            sortText: "A",
            command: { command: "editor.action.triggerSuggest", title: "triggersuggest" },
          });
          completes.push({
            label: datestring2,
            insertText: datestring2 + "\n",
            kind: vscode.CompletionItemKind.Text,
            sortText: "B",
            command: { command: "editor.action.triggerSuggest", title: "triggersuggest" },
          });
        } else if (currentkey == "author:") {
          completes.push({
            label: userfullname,
            insertText: userfullname,
            kind: vscode.CompletionItemKind.Text,
          });
        } else if (currentkey == "credit:") {
          completes.push({
            label: "By",
            insertText: "By\n",
            kind: vscode.CompletionItemKind.Text,
            command: { command: "editor.action.triggerSuggest", title: "triggersuggest" },
          });
          completes.push({
            label: "Written by",
            insertText: "Written by\n",
            kind: vscode.CompletionItemKind.Text,
            command: { command: "editor.action.triggerSuggest", title: "triggersuggest" },
          });
        } else if (currentkey == "source:") {
          completes.push({ label: "Story by ", kind: vscode.CompletionItemKind.Text });
          completes.push({ label: "Based on ", kind: vscode.CompletionItemKind.Text });
        } else if (currentkey == "copyright:") {
          completes.push({
            label: "(c)" + new Date().getFullYear() + " ",
            kind: vscode.CompletionItemKind.Text,
          });
        } else if (currentkey == "font:") {
          fontnames.forEach((fontname: string) => {
            completes.push({
              label: fontname,
              insertText: fontname + "\n",
              kind: vscode.CompletionItemKind.Text,
            });
          });
        }
      }
    }
    //Scene header autocomplete
    else if (parsedDocument.properties.sceneLines.indexOf(position.line) > -1) {
      //Time of day
      if (currentline.trimRight().endsWith("-")) {
        const addspace = !currentline.endsWith(" ");
        completes.push(TimeofDayCompletion("DAY", addspace, "A"));
        completes.push(TimeofDayCompletion("NIGHT", addspace, "B"));
        completes.push(TimeofDayCompletion("DUSK", addspace, "C"));
        completes.push(TimeofDayCompletion("DAWN", addspace, "D"));
      } else {
        const scenematch = currentline.match(
          /^((?:\*{0,3}_?)?(?:(?:int|ext|est|int\.?\/ext|i\.?\/e\.?).? ))/gi
        );
        if (scenematch) {
          const previousLabels = [];
          for (const index in parsedDocument.properties.sceneNames) {
            const spacepos = parsedDocument.properties.sceneNames[index].indexOf(" ");
            if (spacepos != -1) {
              const thisLocation = parsedDocument.properties.sceneNames[index]
                .slice(parsedDocument.properties.sceneNames[index].indexOf(" "))
                .trimLeft();
              if (previousLabels.indexOf(thisLocation) == -1) {
                previousLabels.push(thisLocation);
                if (
                  parsedDocument.properties.sceneNames[index]
                    .toLowerCase()
                    .startsWith(scenematch[0].toLowerCase())
                ) {
                  completes.push({
                    label: thisLocation,
                    documentation: "Scene heading",
                    sortText: "A" + (10 - scenematch[0].length),
                  });
                  //The (10-scenematch[0].length) is a hack to avoid a situation where INT. would be before INT./EXT. when it should be after
                } else
                  completes.push({
                    label: thisLocation,
                    documentation: "Scene heading",
                    sortText: "B",
                  });
              }
            }
          }
        }
      }
    }
    //Other autocompletes
    else if (position.line > 0 && currentLineIsEmpty && previousLineIsEmpty) {
      //We aren't on the first line, and the previous line is empty

      //Get current scene number
      /*var this_scene_nb = -1;
			for (let index in fountainDocProps.scenes) {
				if (fountainDocProps.scenes[index].line < position.line)
					this_scene_nb = fountainDocProps.scenes[index].scene
				else
					break;
			}*/
      let charactersWhoSpokeBeforeLast = undefined;
      const charactersFromCurrentSceneHash = new Set();
      if (hasCharacters) {
        // The characters who spoke before the last one, within the current scene
        charactersWhoSpokeBeforeLast = getCharactersWhoSpokeBeforeLast(parsedDocument, position);
        if (charactersWhoSpokeBeforeLast.length > 0) {
          let index = 0;
          charactersWhoSpokeBeforeLast.forEach((character) => {
            const charWithForceSymbolIfNecessary = addForceSymbolToCharacter(character);
            charactersFromCurrentSceneHash.add(character);
            completes.push({
              label: charWithForceSymbolIfNecessary,
              kind: vscode.CompletionItemKind.Keyword,
              sortText: "0A" + index,
              documentation: "Character from the current scene",
              command: { command: "type", arguments: [{ text: "\n" }], title: "newline" },
            });
            index++;
          });
        } else {
          charactersWhoSpokeBeforeLast = undefined;
        }
      }

      completes.push({
        label: "INT. ",
        documentation: "Interior",
        sortText: "1B",
        command: { command: "editor.action.triggerSuggest", title: "triggersuggest" },
      });
      completes.push({
        label: "EXT. ",
        documentation: "Exterior",
        sortText: "1C",
        command: { command: "editor.action.triggerSuggest", title: "triggersuggest" },
      });
      completes.push({
        label: "INT/EXT. ",
        documentation: "Interior/Exterior",
        sortText: "1D",
        command: { command: "editor.action.triggerSuggest", title: "triggersuggest" },
      });
      completes.push({
        label: "EST. ",
        documentation: "Establishing",
        sortText: "1E",
        command: { command: "editor.action.triggerSuggest", title: "triggersuggest" },
      });

      if (hasCharacters) {
        let sortText = "2"; // Add all characters, but after the "INT/EXT" suggestions
        if (charactersWhoSpokeBeforeLast == undefined) {
          sortText = "0A"; //There's no characters in the current scene, suggest characters before INT/EXT
        }
        parsedDocument.properties.characters.forEach((_value: number[], key: string) => {
          if (!charactersFromCurrentSceneHash.has(key))
            completes.push({
              label: key,
              documentation: "Character",
              sortText: sortText,
              kind: vscode.CompletionItemKind.Text,
              command: { command: "type", arguments: [{ text: "\n" }], title: "newline" },
            });
        });
      }
    }
    return completes;
  }
}
