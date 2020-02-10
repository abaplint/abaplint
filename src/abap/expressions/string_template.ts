import {tok, ver, seq, opt, star, altPrio, Expression, IStatementRunnable, optPrio} from "../combi";
import * as Tokens from "../tokens/";
import {Version} from "../../version";
import {Source, StringTemplateFormatting} from ".";

export class StringTemplate extends Expression {
  public getRunnable(): IStatementRunnable {

    const nest = seq(tok(Tokens.StringTemplateBegin),
                     new Source(),
                     optPrio(new StringTemplateFormatting()),
                     star(seq(tok(Tokens.StringTemplateMiddle), new Source(), opt(new StringTemplateFormatting()))),
                     tok(Tokens.StringTemplateEnd));

    return ver(Version.v702, altPrio(nest, tok(Tokens.StringTemplate)));
  }
}