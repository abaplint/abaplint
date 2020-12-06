import {IStatement} from "./_statement";
import {str, seqs, opts} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {

    const def = seqs("DEFERRED", opts("PUBLIC"));

    return seqs("CLASS", ClassName, str("DEFINITION"), def);
  }

}