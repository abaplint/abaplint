import {tok, ver, seq, starPrio, altPrio, Expression} from "../combi";
import * as Tokens from "../../1_lexer/tokens";
import {Version} from "../../../version";
import {StringTemplateSource} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class StringTemplate extends Expression {
  public getRunnable(): IStatementRunnable {

    const nest = seq(tok(Tokens.StringTemplateBegin),
                     StringTemplateSource,
                     starPrio(seq(tok(Tokens.StringTemplateMiddle), StringTemplateSource)),
                     tok(Tokens.StringTemplateEnd));

    return ver(Version.v702, altPrio(nest, tok(Tokens.StringTemplate)));
  }
}