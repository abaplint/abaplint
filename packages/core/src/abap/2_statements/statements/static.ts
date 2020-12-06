import {IStatement} from "./_statement";
import {seq, opts, pers, alt} from "../combi";
import * as Expressions from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class Static implements IStatement {

  public getMatcher(): IStatementRunnable {
    const p = opts(pers(Expressions.Type, Expressions.Value, Expressions.Length, Expressions.Decimals));

    const type = seq(opts(Expressions.ConstantFieldLength), p);

    const ret = seq(alt("STATIC", "STATICS"),
                    Expressions.DefinitionName,
                    alt(type, Expressions.TypeTable));

    return ret;
  }

}