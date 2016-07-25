import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

export class Export extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let db = seq(str("DATA BUFFER"), Reuse.target());
    let memory = seq(str("MEMORY ID"), Reuse.source());
    let target = alt(db, memory);

// todo, replacing parameter_list_t with parameter_list_s seems to cause a infinite loop
// or it is very slow
    let source = alt(Reuse.parameter_list_t(), Reuse.field());

    return seq(str("EXPORT"), source, str("TO"), target, opt(str("COMPRESSION ON")));
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new Export(tokens);
    }
    return undefined;
  }

}