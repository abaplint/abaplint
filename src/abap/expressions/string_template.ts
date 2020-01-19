import {tok, ver, seq, opt, star, alt, Expression, IStatementRunnable} from "../combi";
import * as Tokens from "../tokens/";
import {Version} from "../../version";
import {Source} from "./source";
import {StringTemplateFormatting} from ".";

export class StringTemplate extends Expression {
  public getRunnable(): IStatementRunnable {

    const nest = seq(tok(Tokens.StringTemplateBegin),
                     new Source(),
                     opt(new StringTemplateFormatting()),
                     star(seq(tok(Tokens.StringTemplateMiddle), new Source(), opt(new StringTemplateFormatting()))),
                     tok(Tokens.StringTemplateEnd));

    return ver(Version.v702, alt(nest, tok(Tokens.StringTemplate)));
  }
}