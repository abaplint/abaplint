import {IStatement} from "./_statement";
import {str, seqs, opt, alt, plus} from "../combi";
import {Field, MethodParamOptional} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Events implements IStatement {

  public getMatcher(): IStatementRunnable {

    const exporting = seqs("EXPORTING", plus(new MethodParamOptional()));

    return seqs(alt(str("CLASS-EVENTS"), str("EVENTS")), Field, opt(exporting));
  }

}