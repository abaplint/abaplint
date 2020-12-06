import {IStatement} from "./_statement";
import {seqs, opts} from "../combi";
import {ClassGlobal, InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Interface implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("INTERFACE",
                InterfaceName,
                opts(ClassGlobal));
  }

}