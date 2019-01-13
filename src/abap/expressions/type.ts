import {seq, opt, alt, str, Expression, IStatementRunnable} from "../combi";
import {Constant, FieldChain, TableBody} from "./";

export class Type extends Expression {
  public getRunnable(): IStatementRunnable {
    const likeType = alt(str("LIKE"), str("TYPE"));

// todo, DEFAULT is only valid for definitions in relation to method parameters
    const def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));

    const type = seq(likeType,
                     opt(alt(str("LINE OF"),
                             str("REF TO"))));

    const ret = seq(type,
                    new FieldChain(),
                    opt(new TableBody()),
                    opt(def));

    return ret;
  }
}