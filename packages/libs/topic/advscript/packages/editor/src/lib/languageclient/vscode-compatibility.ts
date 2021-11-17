/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import { createVSCodeApi } from "./vscode-api";
import { Services } from "./services";

// @ts-ignore
export = createVSCodeApi((...args) => Services.get(...args)) as typeof import("vscode");
