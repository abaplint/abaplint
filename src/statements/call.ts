import { Statement } from "./statement";
import Reuse from "./reuse";
import * as Combi from "../combi";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;

// method call
export class Call extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let mname = alt(Reuse.method_name(), Reuse.dynamic());
    let cname = alt(Reuse.field_chain(), Reuse.dynamic());

    let method = seq(opt(seq(cname, Reuse.arrow())), mname);

    let paren = seq(str("("),
                    alt(Reuse.source(), Reuse.parameter_list_s(), Reuse.method_parameters()),
                    str(")"));

    let dynamic = seq(str("PARAMETER-TABLE"), Reuse.source());

    let call = seq(str("CALL METHOD"), method, alt(paren, Reuse.method_parameters(), dynamic));
    return alt(call, Reuse.method_call_chain());
  }

}