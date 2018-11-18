import {seq, str, opt, optPrio, altPrio, alt, Expression, IRunnable} from "../combi";
import {Constant, FieldChain, TypeName, TableBody} from "./";

export class FormParamType extends Expression {
  public getRunnable(): IRunnable {
    const def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));

    const table = seq(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY")),
                      str("TABLE"));

    const tabseq = seq(table, optPrio(seq(str("OF"), new TypeName())));

    const ret = seq(optPrio(str("REF TO")),
                    new TypeName(),
                    opt(def));

    const like = seq(str("LIKE"), new FieldChain(), opt(new TableBody()));

    return alt(seq(str("TYPE"), altPrio(tabseq, ret)), like);
  }
}