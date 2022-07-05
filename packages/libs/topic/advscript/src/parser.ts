import { createBrowerServices, BrowerFileReader, ast } from "@yuyi919/advscript-language-services";
import { LangiumDocument } from "langium";
import path from "path";

const services = createBrowerServices({
  workspace: {
    FileSystemProvider: () => new BrowerFileReader()
  }
});

export function shouldParseFile(file: string) {
  const extensions = services.advscript.LanguageMetaData.fileExtensions;
  return extensions.includes(path.extname(file));
}

export async function parse(path: string, content: string) {
  BrowerFileReader.writeStore(path, content);
  const document = BrowerFileReader.getOrCreateDocument<ast.Document>(services.shared, path);
  await services.shared.workspace.DocumentBuilder.build([document], {
    validationChecks: "all"
  });
  console.log(document);
  const Document = document.parseResult.value;

  // const validationErrors = (document.diagnostics ?? []).filter((e) => e.severity === 1);
  // if (validationErrors.length > 0) {
  //   console.error(colors.red("There are validation errors:"));
  //   for (const validationError of validationErrors) {
  //     console.error(
  //       colors.red(
  //         `line ${validationError.range.start.line + 1}: ${
  //           validationError.message
  //         } [${document.textDocument.getText(validationError.range)}]`
  //       )
  //     );
  //   }
  //   process.exit(1);
  // }

  return Document.content.contents
    .map((item) => {
      if (ast.isStoryBlock(item)) {
        const contents = [] as string[];
        if (ast.isDialog(item)) {
          const modifiers = item.modifiers?.elements;
          const character = item.ref?.ref?.name.text ?? item.ref.$refText;
          if (modifiers.length) {
            modifiers.forEach((modifier) => {
              contents.push(`#${character}:${modifier.ref.$refText}`);
            });
          } else {
            contents.push(`#${character}`);
          }
        }
        for (const content of item.contents) {
          contents.push(
            content.content
              .map((item) => {
                return item.$cstNode.text;
              })
              .join("")
          );
        }
        return contents.join("\n");
      }
      return "\n";
    })
    .join("\n");
}
