import {Statement} from "./_statement";
import {str, seq, alt, opt, tok, altPrio, plus, IStatementRunnable} from "../combi";
import {ParenLeft, ParenRightW} from "../tokens/";
import {ClassName, SimpleName, NamespaceSimpleName, FormParam, FormName} from "../expressions";

export class Form extends Statement {

  public getMatcher(): IStatementRunnable {

    const resume = seq(str("RESUMABLE"),
                       tok(ParenLeft),
                       new ClassName(),
                       tok(ParenRightW));

    const stru = seq(new SimpleName(),
                     str("STRUCTURE"),
                     new NamespaceSimpleName());

    const tables = seq(str("TABLES"), plus(altPrio(stru, new FormParam())));
    const using = seq(str("USING"), plus(new FormParam()));
    const changing = seq(str("CHANGING"), plus(new FormParam()));
    const raising = seq(str("RAISING"), plus(alt(new ClassName(), resume)));

    const ret = seq(str("FORM"),
                    new FormName(),
                    opt(tables),
                    opt(using),
                    opt(changing),
                    opt(raising));

    return ret;
  }

}