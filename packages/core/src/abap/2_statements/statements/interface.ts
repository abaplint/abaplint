import {IStatement} from "./_statement";
import {seq, opts} from "../combi";
import {ClassGlobal, InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Interface implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("INTERFACE",
               InterfaceName,
               opts(ClassGlobal));
  }

}