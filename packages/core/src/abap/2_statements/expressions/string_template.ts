import {tok, vers, seq, starPrios, altPrio, Expression, optPrios} from "../combi";
import * as Tokens from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {Source, StringTemplateFormatting} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class StringTemplate extends Expression {
  public getRunnable(): IStatementRunnable {

    const nest = seq(tok(Tokens.StringTemplateBegin),
                     Source,
                     optPrios(StringTemplateFormatting),
                     starPrios(seq(tok(Tokens.StringTemplateMiddle), Source, optPrios(StringTemplateFormatting))),
                     tok(Tokens.StringTemplateEnd));

    return vers(Version.v702, altPrio(nest, tok(Tokens.StringTemplate)));
  }
}