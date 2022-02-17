import ts, { VisitResult } from "typescript";

export function use(context: ts.TransformationContext, program: ts.Program) {
  return {
    isReferencedAliasDeclaration(node: ts.Node) {
      return isReferencedAliasDeclaration(node, context);
    },
    isValueAliasDeclaration(node: ts.Node) {
      return isValueAliasDeclaration(node, context);
    },
    visitImportClause(node: ts.ImportClause) {
      return visitImportClause(node, context);
    },
    visitExportCalues(node: ts.NamedExportBindings) {
      return visitExportCalues(node, context);
    },
    visitImportDeclaration(
      node: ts.ImportDeclaration,
      sideEffect?: boolean,
      moduleSpecifier?: ts.StringLiteral | string,
      importClauseHook?: (node: ts.ImportClause) => ts.ImportClause
    ) {
      return visitImportDeclaration(node, context, sideEffect, moduleSpecifier, importClauseHook);
    },
    visitExportDeclaration(
      node: ts.ExportDeclaration,
      sideEffect?: boolean,
      moduleSpecifier?: ts.StringLiteral | string,
      exportClauseHook?: (node: ts.NamedExports) => ts.NamedExports
    ) {
      return visitExportDeclaration(node, context, sideEffect, moduleSpecifier, exportClauseHook);
    },
  };
}

export function visitImportOrExportDeclaration(
  node: ts.Node,
  context: ts.TransformationContext,
  sideEffect = false,
  moduleSpecifier?: ts.StringLiteral | string
) {
  if (node) {
    switch (node.kind) {
      case ts.SyntaxKind.ImportDeclaration:
        node = visitImportDeclaration(
          <ts.ImportDeclaration>node,
          context,
          sideEffect,
          moduleSpecifier
        );
        // node &&
        //   console.log(
        //     ((node as ts.ImportDeclaration).importClause
        //       .namedBindings as any).elements.map(
        //       (o) => (o.name as ts.Identifier).escapedText
        //     )
        //   );
        break;
      case ts.SyntaxKind.ExportDeclaration:
        node = visitExportDeclaration(
          <ts.ExportDeclaration>node,
          context,
          sideEffect,
          moduleSpecifier
        );
        // node &&
        //   console.log(
        //     ((node as ts.ExportDeclaration).exportClause as any).elements.map(
        //       (o) => (o.name as ts.Identifier).escapedText
        //     )
        //   );
        break;
    }
  }
  return node;
}
export function visitModuleImportOrExport(
  node: ts.Node,
  visitor: (
    node: ts.ImportDeclaration | ts.ExportDeclaration,
    moduleName: string
  ) => ts.Node | ts.Node[] | null
) {
  if (
    node &&
    (node.kind === ts.SyntaxKind.ImportDeclaration ||
      node.kind === ts.SyntaxKind.ExportDeclaration) &&
    (node as ts.ImportDeclaration | ts.ExportDeclaration).moduleSpecifier
  ) {
    return visitor(
      node as ts.ImportDeclaration | ts.ExportDeclaration,
      (<ts.StringLiteralLike>(<ts.ImportDeclaration | ts.ExportDeclaration>node).moduleSpecifier)
        .text
    );
  }
  return node;
}

export function isExportedName(
  node: ts.ImportSpecifier | ts.ExportSpecifier,
  name = node?.name?.escapedText as string
) {
  const sf = (ts.isImportSpecifier(node) || ts.isExportSpecifier(node)) && node.getSourceFile();
  //@ts-ignore
  return sf ? sf.symbol.exports.has(name) : true;
}
export function gettext(node: any) {
  try {
    return node.getText();
  } catch (error) {
    return "";
  }
}
export function isReferencedAliasDeclaration(
  node: ts.Node,
  context: ts.TransformationContext
): boolean {
  //@ts-ignore
  const resolver = context.getEmitResolver();
  // isImportOrExportSpecifier(node) &&
  // console.log(
  //   'isReferencedAliasDeclaration',
  //   node.name.escapedText,
  //   resolver.isReferencedAliasDeclaration(node)
  // );
  // console.log(
  //   'isReferencedAliasDeclaration',
  //   ts.SyntaxKind[node.kind],
  //   isImportOrExportSpecifier(node) && resolver.isReferencedAliasDeclaration(node),
  //   gettext(node),
  // );
  // ts.isImportSpecifier(node) && node.name.escapedText === 'Subscription' && console.log(node.name.escapedText, resolver.isReferencedAliasDeclaration(node))
  // Elide the import clause if we elide both its name and its named bindings.=
  return resolver.isReferencedAliasDeclaration(node);
}
export function isValueAliasDeclaration(node: ts.Node, context: ts.TransformationContext): boolean {
  //@ts-ignore
  const resolver = context.getEmitResolver();
  // isImportOrExportSpecifier(node) && console.log(
  //   'isValueAliasDeclaration',
  //   ts.SyntaxKind[node.kind],
  //   isImportOrExportSpecifier(node) && resolver.isValueAliasDeclaration(node),
  //   gettext(node),
  //   isExportedName(node as any)
  // );
  // Elide the import clause if we elide both its name and its named bindings.
  // isImportOrExportSpecifier(node) &&
  //   console.log(
  //     'isValueAliasDeclaration',
  //     node.name.escapedText,
  //     resolver.isValueAliasDeclaration(node)
  //   );
  return resolver.isValueAliasDeclaration(node);
}

/**
 *
 * @param node
 * @param transformationContext
 * @param sideEffect 导入是否有副作用，如果为true则在没有default import或named import的情况下保留import
 * @param moduleSpecifier 替换导入模块名称（可选）
 */
export function visitExportDeclaration(
  node: ts.ExportDeclaration,
  transformationContext: ts.TransformationContext,
  sideEffect = false,
  moduleSpecifier?: ts.StringLiteral | string,
  exportClauseHook?: (node: ts.NamedExports) => ts.NamedExports
) {
  const ignoreCheck = !node.exportClause || sideEffect || ts.isNamespaceExport(node.exportClause);
  const sourceClause =
    !exportClauseHook || ts.isNamespaceExport(node.exportClause)
      ? node.exportClause
      : exportClauseHook(node.exportClause);
  const clause = ignoreCheck
    ? sourceClause
    : visitExportCalues(sourceClause, transformationContext);
  return sideEffect || ignoreCheck || clause
    ? ts.factory.updateExportDeclaration(
        node,
        node.decorators,
        node.modifiers,
        node.isTypeOnly,
        clause,
        (moduleSpecifier &&
          (typeof moduleSpecifier === "string"
            ? ts.factory.createStringLiteral(moduleSpecifier)
            : moduleSpecifier)) ||
          node.moduleSpecifier, //ts.factory.createStringLiteral('lodash-es')
        node.assertClause
      )
    : null;
}
/**
 *
 * @param node
 * @param transformationContext
 * @param sideEffect 导入是否有副作用，如果为true则在没有default import或named import的情况下保留import
 * @param moduleSpecifier 替换导入模块名称（可选）
 */
export function visitImportDeclaration(
  node: ts.ImportDeclaration,
  transformationContext: ts.TransformationContext,
  sideEffect = false,
  moduleSpecifier?: ts.StringLiteral | string,
  importClauseHook?: (node: ts.ImportClause) => ts.ImportClause
) {
  const ignoreCheck = !node.importClause || sideEffect;
  const sourceClause =
    !importClauseHook || ts.isNamespaceImport(node.importClause)
      ? node.importClause
      : importClauseHook(node.importClause);
  const clause = ignoreCheck
    ? sourceClause
    : visitImportClause(sourceClause, transformationContext);
  return sideEffect || ignoreCheck || clause
    ? ts.factory.updateImportDeclaration(
        node,
        node.decorators,
        node.modifiers,
        clause,
        (moduleSpecifier &&
          (typeof moduleSpecifier === "string"
            ? ts.factory.createStringLiteral(moduleSpecifier)
            : moduleSpecifier)) ||
          node.moduleSpecifier,
        node.assertClause
      )
    : null;
}
export function getNamedImportOrExport(calues: ts.ImportClause | ts.NamedExports) {
  return ts.isImportClause(calues)
    ? (calues.namedBindings as ts.NamedImports)
    : (calues as ts.NamedExports);
}

export function updateNamedImportOrExport<T extends ts.NamedExports>(
  calues: T,
  namedBindings: ts.ExportSpecifier[]
): T;
export function updateNamedImportOrExport<T extends ts.ImportClause>(
  calues: T,
  namedBindings: ts.ImportSpecifier[]
): T;

export function updateNamedImportOrExport<T extends ts.ImportClause | ts.NamedExports>(
  calues: T,
  namedBindings: any
) {
  return ts.isImportClause(calues)
    ? ts.factory.updateImportClause(
        calues,
        calues.isTypeOnly,
        calues.name,
        ts.factory.createNamedImports(namedBindings)
      )
    : ts.factory.createNamedExports(namedBindings);
}
export function visitImportOrExportCaluse<T extends ts.ImportClause | ts.NamedExportBindings>(
  node: T,
  transformationContext: ts.TransformationContext
): T | undefined {
  return (
    node.kind === ts.SyntaxKind.ImportClause
      ? visitImportClause(<ts.ImportClause>node, transformationContext)
      : node.kind === ts.SyntaxKind.NamedExports
      ? visitExportCalues(<ts.NamedExportBindings>node, transformationContext)
      : node
  ) as T | undefined;
}

export function createImportOrExportFromNamedBindings<
  T extends ts.ImportClause | ts.NamedExportBindings
>(
  decorators: readonly ts.Decorator[] | undefined,
  modifiers: readonly ts.Modifier[] | undefined,
  namedBindings: T,
  moduleSpecifier: ts.Expression
): T extends ts.ImportClause ? ts.ImportDeclaration : ts.ExportDeclaration {
  return (
    namedBindings.kind === ts.SyntaxKind.ImportClause
      ? ts.factory.createImportDeclaration(
          decorators,
          modifiers,
          <ts.ImportClause>namedBindings,
          moduleSpecifier
        )
      : ts.isNamedExportBindings(namedBindings)
      ? ts.factory.createExportDeclaration(
          decorators,
          modifiers,
          false,
          <ts.NamedExportBindings>namedBindings,
          moduleSpecifier
        )
      : namedBindings
  ) as any;
}

/**
 * Visits an import clause, eliding it if it is not referenced.
 *
 * @param node The import clause node.
 */
export function visitImportClause(
  node: ts.ImportClause,
  transformationContext: ts.TransformationContext
): ts.ImportClause {
  // Elide the import clause if we elide both its name and its named bindings.
  const name = isReferencedAliasDeclaration(node, transformationContext) ? node.name : undefined;
  const namedBindings = ts.visitNode(
    node.namedBindings,
    visitNamedImportBindings,
    ts.isNamedImports
  );
  return name || namedBindings
    ? ts.factory.updateImportClause(node, /*isTypeOnly*/ false, name, namedBindings)
    : undefined;

  /**
   * Visits an import specifier, eliding it if it is not referenced.
   * @param node The import specifier node.
   */
  function visitImportSpecifier(node: ts.ImportSpecifier): VisitResult<ts.ImportSpecifier> {
    // Elide an import specifier if it is not referenced.
    return isReferencedAliasDeclaration(node, transformationContext) ? node : undefined;
  }
  /**
   * Visits named import bindings, eliding it if it is not referenced.
   *
   * @param node The named import bindings node.
   */
  function visitNamedImportBindings(
    node: ts.NamedImportBindings
  ): VisitResult<ts.NamedImportBindings> {
    if (node.kind === ts.SyntaxKind.NamespaceImport) {
      // Elide a namespace import if it is not referenced.
      return isReferencedAliasDeclaration(node, transformationContext) ? node : undefined;
    } else {
      // Elide named imports if all of its import specifiers are elided.
      const elements = ts.visitNodes(node.elements, visitImportSpecifier, ts.isImportSpecifier);
      // @ts-ignore
      return ts.some(elements) ? ts.factory.updateNamedImports(node, elements) : undefined;
    }
  }
}

export function visitExportCalues(
  exportClause: ts.NamedExportBindings,
  transformationContext: ts.TransformationContext
) {
  return ts.visitNode(
    exportClause,
    <ts.Visitor>((node) => visitNamedExports(node as ts.NamedExports, transformationContext)),
    ts.isNamedExportBindings
  );
}

/**
 * Visits named exports, eliding it if it does not contain an export specifier that
 * resolves to a value.
 *
 * @param node The named exports node.
 */
export function visitNamedExports(
  node: ts.NamedExports,
  transformationContext: ts.TransformationContext
): VisitResult<ts.NamedExports> {
  /**
   * Visits an export specifier, eliding it if it does not resolve to a value.
   *
   * @param node The export specifier node.
   */
  function visitExportSpecifier(node: ts.ExportSpecifier): VisitResult<ts.ExportSpecifier> {
    // Elide an export specifier if it does not reference a value.
    return isValueAliasDeclaration(node, transformationContext) ? node : undefined;
  }

  // Elide the named exports if all of its export specifiers were elided.
  const elements = ts.visitNodes(
    node.elements,
    <ts.Visitor>visitExportSpecifier,
    ts.isExportSpecifier
  );
  return ts.some(elements) ? ts.factory.updateNamedExports(node, elements) : undefined;
}
