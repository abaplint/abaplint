import {tok, ver, str, seq, opt, star, alt, Expression, IStatementRunnable} from "../combi";
import * as Tokens from "../tokens/";
import {Version} from "../../version";
import {Source} from "./source";

export class StringTemplate extends Expression {
  public getRunnable(): IStatementRunnable {
    const formatting = alt(str("ALPHA = OUT"),
                           str("TIME = USER"),
                           seq(str("WIDTH ="), new Source()),
                           str("DATE = USER"));

    const nest = seq(tok(Tokens.StringTemplateBegin),
                     new Source(),
                     opt(formatting),
                     star(seq(tok(Tokens.StringTemplateMiddle), new Source(), opt(formatting))),
                     tok(Tokens.StringTemplateEnd));

    return ver(Version.v702, alt(nest, tok(Tokens.StringTemplate)));
  }
}