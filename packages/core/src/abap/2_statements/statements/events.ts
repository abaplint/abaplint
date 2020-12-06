import {IStatement} from "./_statement";
import {seqs, opt, alts, plus} from "../combi";
import {Field, MethodParamOptional} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Events implements IStatement {

  public getMatcher(): IStatementRunnable {

    const exporting = seqs("EXPORTING", plus(new MethodParamOptional()));

    return seqs(alts("CLASS-EVENTS", "EVENTS"), Field, opt(exporting));
  }

}