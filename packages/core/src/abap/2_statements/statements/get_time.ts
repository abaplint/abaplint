import {IStatement} from "./_statement";
import {str, seqs, alt, opt} from "../combi";
import {Target} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class GetTime implements IStatement {

  public getMatcher(): IStatementRunnable {
    const options = seqs(alt(str("STAMP FIELD"), str("FIELD")), Target);

    return seqs("GET TIME", opt(options));
  }

}