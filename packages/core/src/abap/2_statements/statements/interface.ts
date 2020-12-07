import {IStatement} from "./_statement";
import {seq, opt} from "../combi";
import {ClassGlobal, InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Interface implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("INTERFACE",
               InterfaceName,
               opt(ClassGlobal));
  }

}