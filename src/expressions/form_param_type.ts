import {seq, str, opt, optPrio, altPrio, alt, Reuse, IRunnable} from "../combi";
import {Constant, FieldChain, TypeName} from "./";

export class FormParamType extends Reuse {
  public get_runnable(): IRunnable {
    let def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));

    let table = seq(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY")),
                    str("TABLE"));

    let tabseq = seq(table, optPrio(seq(str("OF"), new TypeName)));

    let ret = seq(optPrio(str("REF TO")),
                  new TypeName(),
                  opt(def));

    let like = seq(str("LIKE"), new FieldChain());

    return alt(seq(str("TYPE"), altPrio(tabseq, ret)), like);
  }
}