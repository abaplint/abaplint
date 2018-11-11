import {seq, str, opt, optPrio, altPrio, alt, Expression, IRunnable} from "../combi";
import {Constant, FieldChain, TypeName, TableBody} from "./";

export class FormParamType extends Expression {
  public getRunnable(): IRunnable {
    let def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));

    let table = seq(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY")),
                    str("TABLE"));

    let tabseq = seq(table, optPrio(seq(str("OF"), new TypeName())));

    let ret = seq(optPrio(str("REF TO")),
                  new TypeName(),
                  opt(def));

    let like = seq(str("LIKE"), new FieldChain(), opt(new TableBody()));

    return alt(seq(str("TYPE"), altPrio(tabseq, ret)), like);
  }
}