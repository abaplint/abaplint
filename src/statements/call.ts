import {Statement} from "./statement";
import * as Reuse from "./reuse";
import * as Combi from "../combi";
import {Arrow} from "../tokens/";

let str = Combi.str;
let seq = Combi.seq;
let alt = Combi.alt;
let opt = Combi.opt;
let tok = Combi.tok;

// method call
export class Call extends Statement {

  public static get_matcher(): Combi.IRunnable {
    let mname = alt(new Reuse.MethodName(), new Reuse.Dynamic());
    let cname = alt(new Reuse.FieldChain(), new Reuse.Dynamic());

    let method = seq(opt(seq(cname, tok(Arrow))), mname);

    let paren = seq(str("("),
                    alt(new Reuse.Source(), new Reuse.ParameterListS(), new Reuse.MethodParameters()),
                    str(")"));

    let dynamic = seq(str("PARAMETER-TABLE"), new Reuse.Source());

    let call = seq(str("CALL METHOD"), method, alt(paren, new Reuse.MethodParameters(), dynamic));
    return alt(call, new Reuse.MethodCallChain());
  }

}