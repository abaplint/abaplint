import {IStatement} from "./_statement";
import {seq} from "../combi";
import {InterfaceName} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class InterfaceLoad implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq("INTERFACE",
               InterfaceName,
               "LOAD");
  }

}