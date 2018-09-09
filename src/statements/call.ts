import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, alt, opt, tok, IRunnable} from "../combi";
import {Arrow, ParenLeftW} from "../tokens/";

// method call
export class Call extends Statement {

  public static get_matcher(): IRunnable {
    let mname = alt(new Reuse.MethodName(), new Reuse.Dynamic());
    let cname = alt(new Reuse.FieldChain(), new Reuse.Dynamic());

    let method = seq(opt(seq(cname, tok(Arrow))), mname);

    let paren = seq(tok(ParenLeftW),
                    alt(new Reuse.Source(), new Reuse.ParameterListS(), new Reuse.MethodParameters()),
                    str(")"));

    let dynamicPar = seq(str("PARAMETER-TABLE"), new Reuse.Source());
    let dynamicExc = seq(str("EXCEPTION-TABLE"), new Reuse.Source());
    let dynamic = seq(dynamicPar, opt(dynamicExc));

    let call = seq(str("CALL"),
                   alt(str("METHOD"), str("BADI")),
                   method,
                   alt(paren, new Reuse.MethodParameters(), dynamic));

    return alt(call, new Reuse.MethodCallChain());
  }

}