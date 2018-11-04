import {Statement} from "./_statement";
import {str, seq, alt, opt, per, IRunnable} from "../combi";
import {Integer, FieldLength, Type, Value, TypeTable, NamespaceSimpleName} from "../expressions";

export class Data extends Statement {

  public getMatcher(): IRunnable {
    let start = alt(str("CLASS-DATA"), str("DATA"));

    let simple = seq(opt(new Type()),
                     opt(per(str("READ-ONLY"), new Value())));

    let initial = seq(str("INITIAL SIZE"), new Integer());

    let table = seq(new TypeTable(),
                    opt(str("READ-ONLY")),
                    opt(initial));

    return seq(start, new NamespaceSimpleName(), opt(new FieldLength()), alt(simple, table));
  }

}