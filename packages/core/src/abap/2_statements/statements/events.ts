import {IStatement} from "./_statement";
import {seq, opt, alt, plus} from "../combi";
import {EventName, MethodParamOptional} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Events implements IStatement {

  public getMatcher(): IStatementRunnable {

    const exporting = seq("EXPORTING", plus(MethodParamOptional));

    return seq(alt("CLASS-EVENTS", "EVENTS"), EventName, opt(exporting));
  }

}