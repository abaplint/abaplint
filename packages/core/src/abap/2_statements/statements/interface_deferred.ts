import {IStatement} from "./_statement";
import {seqs, opts} from "../combi";
import {InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seqs("INTERFACE",
                InterfaceName,
                "DEFERRED",
                opts("PUBLIC"));
  }

}