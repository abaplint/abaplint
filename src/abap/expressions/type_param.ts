import {seq, opt, alt, str, Expression, IRunnable} from "../combi";
import {Constant, FieldChain, TypeName} from "./";

export class TypeParam extends Expression {
  public get_runnable(): IRunnable {
    let def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));

    let table = seq(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY")),
                    str("TABLE"));

    let foo = seq(opt(seq(table, str("OF"))), opt(str("REF TO")));

    let typeLine = str("LINE OF");

    let ret = seq(alt(foo, typeLine),
                  new TypeName(),
                  opt(def));

    let like = seq(str("LIKE"), opt(str("LINE OF")), new FieldChain(), opt(def));

    return alt(seq(str("TYPE"), alt(table, ret)), like);
  }
}