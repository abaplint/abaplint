import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDefinitionLoad implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("CLASS", ClassName, "DEFINITION LOAD");
  }

}