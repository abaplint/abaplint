import {Statement} from "./_statement";
import {verNot, str, seq, alt, opt, tok, altPrio, plus, IRunnable} from "../combi";
import {ParenLeft, ParenRight, ParenRightW} from "../tokens/";
import {ClassName, SimpleName, NamespaceSimpleName, FormParam, FormName} from "../expressions";
import {Version} from "../../version";

export class Form extends Statement {

  public getMatcher(): IRunnable {

    let resume = seq(str("RESUMABLE"),
                     tok(ParenLeft),
                     new ClassName(),
                     alt(tok(ParenRight), tok(ParenRightW)));

    let stru = seq(new SimpleName(),
                   str("STRUCTURE"),
                   new NamespaceSimpleName());

    let tables = seq(str("TABLES"), plus(altPrio(stru, new FormParam())));
    let using = seq(str("USING"), plus(new FormParam()));
    let changing = seq(str("CHANGING"), plus(new FormParam()));
    let raising = seq(str("RAISING"), plus(alt(new ClassName(), resume)));

    let ret = seq(str("FORM"),
                  new FormName(),
                  opt(tables),
                  opt(using),
                  opt(changing),
                  opt(raising));

    return verNot(Version.Cloud, ret);
  }

}