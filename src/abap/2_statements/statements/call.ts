import {IStatement} from "./_statement";
import {str, seq, alt, IStatementRunnable} from "../combi";
import {MethodCallChain, MethodSource, MethodCallBody} from "../expressions";

// method call
export class Call implements IStatement {

  public getMatcher(): IStatementRunnable {

    const call = seq(str("CALL"),
                     str("METHOD"),
                     new MethodSource(),
                     new MethodCallBody());

    return alt(call, new MethodCallChain());
  }

}