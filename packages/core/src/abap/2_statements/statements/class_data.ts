import {IStatement} from "./_statement";
import {seq} from "../combi";
import {DataDefinition} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassData implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("CLASS-DATA", DataDefinition);
  }

}