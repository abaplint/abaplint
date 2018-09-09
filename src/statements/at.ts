import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, IRunnable} from "../combi";

export class At extends Statement {

  public static get_matcher(): IRunnable {
    let field = alt(new Reuse.FieldSub(),
                    new Reuse.Dynamic(),
                    new Reuse.FieldSymbol());

    let atNew = seq(str("NEW"), field);
    let atEnd = seq(str("END OF"), field);

    let ret = seq(str("AT"), alt(str("FIRST"), str("LAST"), atNew, atEnd));

    return ret;
  }

  public isStructure() {
    return true;
  }

  public indentationEnd(_prev) {
    return 2;
  }

}