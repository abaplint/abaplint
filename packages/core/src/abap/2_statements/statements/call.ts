import {IStatement} from "./_statement";
import {seqs, altPrio} from "../combi";
import {MethodCallChain, MethodSource, MethodCallBody} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

// method call
export class Call implements IStatement {

  public getMatcher(): IStatementRunnable {

    const call = seqs("CALL",
                      "METHOD",
                      MethodSource,
                      MethodCallBody);

    return altPrio(call, new MethodCallChain());
  }

}