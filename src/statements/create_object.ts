import { Statement } from "./statement";
import { Token } from "../tokens/";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let opt = Combi.opt;
let alt = Combi.alt;

export class CreateObject extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let exporting = seq(str("EXPORTING"), Reuse.parameter_list_s());
    let exceptions = seq(str("EXCEPTIONS"), Reuse.parameter_list_exceptions());

    let dyn = seq(str("("), Reuse.field_chain(), str(")"));
    let type = seq(str("TYPE"), alt(Reuse.class_name(), dyn));
    let ret = seq(str("CREATE OBJECT"), Reuse.target(), opt(type), opt(exporting), opt(exceptions));
    return ret;
  }

  public static match(tokens: Array<Token>): Statement {
    let result = Combi.Combi.run(this.get_matcher(), tokens, true);
    if (result === true) {
      return new CreateObject(tokens);
    }
    return undefined;
  }

}