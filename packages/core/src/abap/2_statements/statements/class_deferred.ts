import {IStatement} from "./_statement";
import {str, seqs, opt} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {

    const def = seqs("DEFERRED", opt(str("PUBLIC")));

    return seqs("CLASS", ClassName, str("DEFINITION"), def);
  }

}