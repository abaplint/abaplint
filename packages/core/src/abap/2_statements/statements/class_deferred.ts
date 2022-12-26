import {IStatement} from "./_statement";
import {seq, optPrio} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("CLASS", ClassName, "DEFINITION DEFERRED", optPrio("PUBLIC"));
  }

}