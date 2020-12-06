import {IStatement} from "./_statement";
import {seqs} from "../combi";
import {InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceLoad implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("INTERFACE",
                InterfaceName,
                "LOAD");
  }

}