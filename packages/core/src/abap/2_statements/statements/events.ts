import {IStatement} from "./_statement";
import {seq, plus, altPrio, optPrio} from "../combi";
import {EventName, MethodParamOptional} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Events implements IStatement {

  public getMatcher(): IStatementRunnable {

    const exporting = seq("EXPORTING", plus(MethodParamOptional));

    return seq(altPrio("CLASS-EVENTS", "EVENTS"), EventName, optPrio(exporting));
  }

}