import {IStatement} from "./_statement";
import {str, seqs, opt} from "../combi";
import {InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("INTERFACE",
                InterfaceName,
                "DEFERRED",
                opt(str("PUBLIC")));
  }

}