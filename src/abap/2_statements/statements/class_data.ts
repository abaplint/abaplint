import {IStatement} from "./_statement";
import {str, seq} from "../combi";
import {DataDefinition} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassData implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CLASS-DATA"), new DataDefinition());
  }

}