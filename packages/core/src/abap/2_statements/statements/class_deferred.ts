import {IStatement} from "./_statement";
import {str, seq, opt} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {

    const def = seq(str("DEFERRED"), opt(str("PUBLIC")));

    return seq(str("CLASS"), new ClassName(), str("DEFINITION"), def);
  }

}