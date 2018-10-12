import {Statement} from "./statement";
import {str, seq, alt, opt, tok, IRunnable} from "../combi";
import {Arrow, ParenLeftW} from "../tokens/";
import {Source, MethodName, Dynamic, FieldChain, ParameterListS, MethodParameters, MethodCallChain} from "../expressions";

// method call
export class Call extends Statement {

  public get_matcher(): IRunnable {
    let mname = alt(new MethodName(), new Dynamic());
    let cname = alt(new FieldChain(), new Dynamic());

    let method = seq(opt(seq(cname, tok(Arrow))), mname);

    let paren = seq(tok(ParenLeftW),
                    alt(new Source(), new ParameterListS(), new MethodParameters()),
                    str(")"));

    let dynamicPar = seq(str("PARAMETER-TABLE"), new Source());
    let dynamicExc = seq(str("EXCEPTION-TABLE"), new Source());
    let dynamic = seq(dynamicPar, opt(dynamicExc));

    let call = seq(str("CALL"),
                   alt(str("METHOD"), str("BADI")),
                   method,
                   alt(paren, new MethodParameters(), dynamic));

    return alt(call, new MethodCallChain());
  }

}