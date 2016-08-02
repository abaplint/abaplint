import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Raise extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let simple = seq(str("RAISE"), Reuse.field());
    let clas = seq(str("RAISE EXCEPTION TYPE"), Reuse.class_name(), opt(seq(str("EXPORTING"), Reuse.parameter_list_s())));
    return alt(simple, clas);
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Raise(tokens);
    }
    return undefined;
  }

}