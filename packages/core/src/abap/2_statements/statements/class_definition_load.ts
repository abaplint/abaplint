import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDefinitionLoad implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CLASS"), new ClassName(), str("DEFINITION LOAD"));
  }

}