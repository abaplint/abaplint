import {seq, opt, optPrio, alt, str, Expression, IStatementRunnable} from "../combi";
import {TableBody, Constant, FieldChain, TypeNameOrInfer} from "./";

export class TypeParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));

    const table = seq(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY")),
                      str("TABLE"));

    const foo = seq(opt(seq(table, str("OF"))), opt(str("REF TO")));

    const typeLine = str("LINE OF");

    const ret = seq(alt(foo, typeLine),
                    new TypeNameOrInfer(),
                    opt(def));

    const like = seq(str("LIKE"), opt(str("LINE OF")), new FieldChain(), optPrio(new TableBody()), optPrio(def));

    return alt(seq(str("TYPE"), alt(table, ret)), like);
  }
}