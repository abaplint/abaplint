import {IStatement} from "./_statement";
import {str, seq, opts} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {

    const def = seq("DEFERRED", opts("PUBLIC"));

    return seq("CLASS", ClassName, str("DEFINITION"), def);
  }

}