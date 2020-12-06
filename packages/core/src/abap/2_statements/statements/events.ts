import {IStatement} from "./_statement";
import {seq, opts, alt, pluss} from "../combi";
import {Field, MethodParamOptional} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Events implements IStatement {

  public getMatcher(): IStatementRunnable {

    const exporting = seq("EXPORTING", pluss(MethodParamOptional));

    return seq(alt("CLASS-EVENTS", "EVENTS"), Field, opts(exporting));
  }

}