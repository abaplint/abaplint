import * as Statements from "../statements";

// tslint:disable-next-line:no-empty
function seq(_first: Object, ..._rest: Object[]): void {
}

export class Class {

  public static get_matcher(): void {
    return seq(Statements.ClassDefinition,
               Statements.Endclass,
               Statements.ClassImplementation,
               Statements.Endclass);
  }

}