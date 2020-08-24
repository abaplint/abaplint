import {IStatement} from "./_statement";
import {str, seq, opt} from "../combi";
import {ClassGlobal, InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Interface implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("INTERFACE"),
               new InterfaceName(),
               opt(new ClassGlobal()));
  }

}