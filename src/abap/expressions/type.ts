import {seq, opt, alt, str, Expression, IStatementRunnable} from "../combi";
import {Default, FieldChain, TableBody} from "./";

export class Type extends Expression {
  public getRunnable(): IStatementRunnable {
    const likeType = alt(str("LIKE"), str("TYPE"));

    const type = seq(likeType,
                     opt(alt(str("LINE OF"),
                             str("REF TO"))));

    const ret = seq(type,
                    new FieldChain(),
                    opt(new TableBody()),
                    opt(new Default()));

    return ret;
  }
}