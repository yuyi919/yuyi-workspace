/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import colors from "colors";
import { Command } from "commander";
import { Statemachine } from "../language-server/generated/ast";
import { StatemachineLanguageMetaData } from "../language-server/generated/module";
import { createStatemachineServices } from "../language-server/statemachine-module";
import { extractAstNode } from "./cli-util";
import { generateNode, GenerateOptions } from "./generateNode";
import { write } from "./generator";

export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
  const services = createStatemachineServices().statemachine;
  const model = await extractAstNode<Statemachine>(fileName, services);
  const text = services.shared.workspace.TextDocuments.get(fileName)?.getText();
  const ctx = generateNode(text, fileName, opts);
  const generatedFilePath = write(ctx);
  console.log(colors.green(`C++ code generated successfully: ${generatedFilePath}`));
};

export default function (): void {
  const program = new Command();
  const fileExtensions = StatemachineLanguageMetaData.fileExtensions.join(", ");
  program
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // .version(require("../../package.json").version)
    .command("generate")
    .argument("<file>", `possible file extensions: ${fileExtensions}`)
    .option("-d, --destination <dir>", "destination directory of generating")
    .description("generates a C++ CLI to walk over states")
    .action(generateAction);

  program.parse(process.argv);
}
