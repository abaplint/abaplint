import {IStatement} from "./_statement";
import {seqs, opt, per, alts} from "../combi";
import * as Expressions from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Static implements IStatement {

  public getMatcher(): IStatementRunnable {
    const p = opt(per(new Expressions.Type(), new Expressions.Value(), new Expressions.Length(), new Expressions.Decimals()));

    const type = seqs(opt(new Expressions.ConstantFieldLength()), p);

    const ret = seqs(alts("STATIC", "STATICS"),
                     Expressions.DefinitionName,
                     alts(type, Expressions.TypeTable));

    return ret;
  }

}