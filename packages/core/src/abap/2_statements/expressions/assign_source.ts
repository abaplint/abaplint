import {seq, alt, tok, opt, Expression, ver, AlsoIn, verNotLang} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {IStatementRunnable} from "../statement_runnable";
import {Source} from "./source";
import {Dynamic} from "./dynamic";
import {Field} from "./field";
import {SimpleSource3} from "./simple_source3";
import {Release, LanguageVersion} from "../../../version";

export class AssignSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const component = seq("COMPONENT",
                          alt(SimpleSource3, ver(Release.v740sp02, Source, {also: AlsoIn.OpenABAP})),
                          "OF STRUCTURE",
                          Source);

    // TABLE FIELD form: blocked in KeyUser
    const tableField = verNotLang(LanguageVersion.KeyUser, seq("TABLE FIELD", alt(Source, Dynamic)));

    // class=>(dyn_attr) via static arrow is blocked in KeyUser
    // ref->(dyn_comp) via instance arrow is allowed — leave unguarded
    const arrowDynamic = alt(
      tok(InstanceArrow),
      verNotLang(LanguageVersion.KeyUser, tok(StaticArrow)),
    );

    const anyArrow = alt(tok(InstanceArrow), tok(StaticArrow));
    const source = alt(seq(Source, opt(seq(arrowDynamic, Dynamic))),
                       component,
                       tableField,
                       // standalone dynamic symbol (dyn_sym) blocked in KeyUser
                       verNotLang(LanguageVersion.KeyUser,
                                  seq(Dynamic, opt(seq(anyArrow, alt(Field, Dynamic))))));

    return source;
  }
}