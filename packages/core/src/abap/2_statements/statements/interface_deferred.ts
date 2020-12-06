import {IStatement} from "./_statement";
import {seq, opts} from "../combi";
import {InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceDeferred implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("INTERFACE",
               InterfaceName,
               "DEFERRED",
               opts("PUBLIC"));
  }

}