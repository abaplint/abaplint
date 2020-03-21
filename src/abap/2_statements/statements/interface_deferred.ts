import {IStatement} from "./_statement";
import {str, seq, opt} from "../combi";
import {InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("INTERFACE"),
               new InterfaceName(),
               str("DEFERRED"),
               opt(str("PUBLIC")));
  }

}