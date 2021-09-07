/* eslint-disable no-extra-boolean-cast */
import { BuilderContext, BuilderOutput, createBuilder } from "@angular-devkit/architect";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { BuildBuilderSchema } from "./schema";
import { updateDeps } from "../../generators/shared";

export function runBuilder(
  options: BuildBuilderSchema,
  context: BuilderContext
): Observable<BuilderOutput> {
  updateDeps({
    workspaceRoot: context.workspaceRoot,
    projectDir: context.target.project,
  });
  return of({ success: true }).pipe(
    tap(() => {
      context.logger.info("Builder ran for build");
    })
  );
}

export default createBuilder(runBuilder);
