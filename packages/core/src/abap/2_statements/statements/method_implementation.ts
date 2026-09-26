import {IStatement} from "./_statement";
import {seq, opt, optPrio, alt, plus, altPrio, per, regex as reg, verNotLang} from "../combi";
import {MethodName, Language, SimpleFieldChain} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";
import {LanguageVersion} from "../../../version";

export class MethodImplementation implements IStatement {

  public getMatcher(): IStatementRunnable {
    const name = reg(/[\w~]+/);

    const kernel = seq("KERNEL MODULE",
                       plus(name),
                       optPrio(altPrio("FAIL", "IGNORE")));

    const using = seq("USING", plus(SimpleFieldChain));

    const options = seq("OPTIONS", per("READ-ONLY", "SUPPRESS SYNTAX ERRORS", "DETERMINISTIC"));

    const database = seq("DATABASE", alt("PROCEDURE", "FUNCTION", "GRAPH WORKSPACE"), "FOR HDB",
                         Language,
                         opt(options),
                         opt(using));

    // BY DATABASE and BY KERNEL both blocked in KeyUser
    const by = verNotLang(LanguageVersion.KeyUser, seq("BY", alt(kernel, database)));

    return seq("METHOD", MethodName, optPrio(by));
  }

}