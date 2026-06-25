import {seq, opt, alt, ver, Expression, altPrio, plus, optPrio, failStar, AlsoIn} from "../combi";
import {FieldSub, Field} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TypeTableKey extends Expression {
  public getRunnable(): IStatementRunnable {

    const uniqueness = alt("NON-UNIQUE", "UNIQUE");
    const defaultKey = "DEFAULT KEY";
    const emptyKey = ver(Release.v740sp02, "EMPTY KEY", {also: AlsoIn.OpenABAP});

    const components = plus(alt(seq("WITH", failStar()), FieldSub));

    const further = seq(alt("WITHOUT", "WITH"), "FURTHER SECONDARY KEYS");

    const alias = seq("ALIAS", Field);

    const key = seq("WITH",
                    opt(uniqueness),
                    altPrio(defaultKey, emptyKey,
                            seq(opt(alt("SORTED", "HASHED")),
                                "KEY",
                                alt(seq(Field, opt(alias), "COMPONENTS", components),
                                    components))),
                    optPrio(further),
                    optPrio("READ-ONLY"));

    return key;
  }

}
