import {IStatement} from "./_statement";
import {str, seq, opt, alt, plus} from "../combi";
import {ClassName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class ClassOther implements IStatement {

  public getMatcher(): IStatementRunnable {

    const def = seq(str("DEFERRED"),
                    opt(str("PUBLIC")));

    const local = seq(str("LOCAL FRIENDS"), plus(new ClassName()));

    return seq(str("CLASS"), new ClassName(), str("DEFINITION"), alt(def, local));
  }

}