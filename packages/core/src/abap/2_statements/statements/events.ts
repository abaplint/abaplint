import {IStatement} from "./_statement";
import {seqs, opts, alts, pluss} from "../combi";
import {Field, MethodParamOptional} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Events implements IStatement {

  public getMatcher(): IStatementRunnable {

    const exporting = seqs("EXPORTING", pluss(MethodParamOptional));

    return seqs(alts("CLASS-EVENTS", "EVENTS"), Field, opts(exporting));
  }

}