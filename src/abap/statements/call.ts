import {Statement} from "./_statement";
import {str, seq, alt, opt, tok, IStatementRunnable} from "../combi";
import {Arrow, ParenLeftW} from "../tokens/";
import {Source, MethodName, Dynamic, FieldChain, ParameterListS, MethodParameters, MethodCallChain} from "../expressions";

// method call
export class Call extends Statement {

  public getMatcher(): IStatementRunnable {
    const mname = alt(new MethodName(), new Dynamic());
    const cname = alt(new FieldChain(), new MethodCallChain(), new Dynamic());

    const method = seq(opt(seq(cname, tok(Arrow))), mname);

    const paren = seq(tok(ParenLeftW),
                      alt(new Source(), new ParameterListS(), new MethodParameters()),
                      str(")"));

    const dynamicPar = seq(str("PARAMETER-TABLE"), new Source());
    const dynamicExc = seq(str("EXCEPTION-TABLE"), new Source());
    const dynamic = seq(dynamicPar, opt(dynamicExc));

// todo, move BADI to new statement, plus it is not Cloud relevant
    const call = seq(str("CALL"),
                     alt(str("METHOD"), str("BADI")),
                     method,
                     alt(paren, new MethodParameters(), dynamic));

    return alt(call, new MethodCallChain());
  }

}