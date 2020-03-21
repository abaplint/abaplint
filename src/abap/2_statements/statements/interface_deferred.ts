import {IStatement} from "./_statement";
import {str, seq, opt, IStatementRunnable} from "../combi";
import {InterfaceName} from "../expressions";

export class InterfaceDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("INTERFACE"),
               new InterfaceName(),
               str("DEFERRED"),
               opt(str("PUBLIC")));
  }

}