import { CompositeGeneratorNode, NL } from "langium";
import path from 'path';
import type { GeneratorContext } from "./generator";

export function generateWith<T>(
  statemachine: T,
  filePath: string,
  destination: string | undefined,
  wrapper: (context: GeneratorContext<T>) => void
) {
  const data = extractDestinationAndName(filePath, destination);
  const ctx = {
    statemachine,
    fileName: `${data.name}.ts`,
    destination: data.destination,
    fileNode: new CompositeGeneratorNode(),
    NL,
  } as GeneratorContext<T>;
  wrapper(ctx);
  return ctx;
}
 
 interface FilePathData {
     destination: string,
     name: string
 }
 
 export function extractDestinationAndName(filePath: string, destination: string | undefined): FilePathData {
     filePath = filePath.replace(/\..*$/, '').replace(/[.-]/g, '');
     return {
         destination: destination ?? path.join(path.dirname(filePath), 'generated'),
         name: path.basename(filePath)
     };
 }
 