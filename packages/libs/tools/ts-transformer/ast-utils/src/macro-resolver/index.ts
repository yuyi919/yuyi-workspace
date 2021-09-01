import path from "path";
import ts from "typescript";
import { use } from "../visit";
import { VisitorContext } from "../factory";

/**
 * 
 * @param modulePath 
 * @param callerName 
 * @param options 
 */
export function createMacroFunctionResolver(
  modulePath: string,
  callerName: string,
  options: Pick<VisitorContext<any>, "program" | "transformationContext" | "isDeclarationFile">
) {
  const { program, transformationContext: context } = options;
  const moduleJsPath = modulePath.endsWith(".d.ts")
    ? modulePath.replace(/\.d\.ts$/, ".js")
    : modulePath;
  const typeChecker = program.getTypeChecker();
  const Visitor = use(context, program);
  return {
    isImportOrExport(node: ts.Node): node is ts.ImportDeclaration | ts.ExportDeclaration {
      // const c = ts.isImportDeclaration(node) && node.importClause
      // if (c && !ts.isNamespaceImport(c.namedBindings)) {
      //   c.namedBindings.elements.forEach(el => {
      //     const r = el.symbol.getDeclarations()
      //   })
      // }
      return isRefedImportOrExport(node, callerName, moduleJsPath);
    },
    cleanImportOrExport(node: ts.ImportDeclaration | ts.ExportDeclaration) {
      if (ts.isExportDeclaration(node)) {
        return Visitor.visitExportDeclaration(node, options.isDeclarationFile, void 0, (bind: ts.NamedExports) => {
          const nextElements = bind.elements.filter((node) => node.name.text !== callerName);
          if (nextElements.length !== bind.elements.length) {
            Object.assign(bind, { elements: nextElements });
            // bind = ts.factory.updateNamedExports(bind, nextElements);
          }
          return bind;
        });
      }
      return Visitor.visitImportDeclaration(node, options.isDeclarationFile, void 0, (caluse) => {
        var binds: ts.NamedImportBindings | undefined = node.importClause.namedBindings;
        if (ts.isNamedImports(binds)) {
          const nextElements = binds.elements.filter((node) => node.name.text !== callerName);
          // if (nextElements.length === 0) {
          //   if (!node.importClause.name) {
          //   } else {
          //     binds = undefined;
          //   }
          // } else {
          if (nextElements.length !== binds.elements.length) {
            binds = ts.factory.createNamedImports(nextElements);
          }
          // }
        }
        return Object.assign(caluse, { namedBindings: binds });
      });
    },
    isCallExpression(node: ts.Node) {
      return isRefedCallExpression(node, typeChecker, callerName, modulePath);
    },
    isDecorator(node: ts.Node) {
      return ts.isDecorator(node) && isRefedCallExpression(node.expression, typeChecker, callerName, modulePath);
    },
  };
}

function isRefedImportOrExport(
  node: ts.Node,
  callerName: string,
  moduleAbsolutePath: string
): node is ts.ImportDeclaration | ts.ExportDeclaration {
  if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) {
    return false;
  }
  if (ts.isExportDeclaration(node) && !node.moduleSpecifier) {
    return (
      ts.isNamedExports(node.exportClause) &&
      node.exportClause.elements.some((i) => i.name.text === callerName)
    );
  }
  const module = (node.moduleSpecifier as ts.StringLiteral).text;
  try {
    return (
      moduleAbsolutePath ===
      (module.startsWith(".")
        ? require.resolve(path.resolve(path.dirname(node.getSourceFile().fileName), module))
        : require.resolve(module))
    );
  } catch (e) {
    return false;
  }
}
function isRefedCallExpression(
  node: ts.Node,
  typeChecker: ts.TypeChecker,
  callerName: string,
  moduleAbsolutePath: string
): node is ts.CallExpression {
  if (!ts.isCallExpression(node)) {
    return false;
  }
  const declaration = typeChecker.getResolvedSignature(node)?.declaration;
  if (
    !declaration ||
    ts.isJSDocSignature(declaration) ||
    declaration.name?.getText() !== callerName
  ) {
    return false;
  }
  try {
    // require.resolve is required to resolve symlink.
    // https://github.com/kimamula/ts-transformer-keys/issues/4#issuecomment-643734716
    return require.resolve(declaration.getSourceFile().fileName) === moduleAbsolutePath;
  } catch {
    // declaration.getSourceFile().fileName may not be in Node.js require stack and require.resolve may result in an error.
    // https://github.com/kimamula/ts-transformer-keys/issues/47
    return false;
  }
}
