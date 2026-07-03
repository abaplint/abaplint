import {seq, opt, alt, ver, Expression, altPrio, plusPrio, optPrio, stopBefore1, stopBefore, AlsoIn} from "../combi";
import {FieldSub, Field} from ".";
import {Release} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TypeTableKey extends Expression {
  public getRunnable(): IStatementRunnable {

    const uniqueness = alt("NON-UNIQUE", "UNIQUE");
    const defaultKey = "DEFAULT KEY";
    const emptyKey = ver(Release.v740sp02, "EMPTY KEY", {also: AlsoIn.OpenABAP});

    const components = plusPrio(seq(stopBefore1("WITH", "INITIAL", "WITHOUT"), stopBefore("READ", "-"), FieldSub));

    const further = seq(alt("WITHOUT", "WITH"), "FURTHER SECONDARY KEYS");

    const alias = seq("ALIAS", Field);

    const key = seq("WITH",
                    optPrio(uniqueness),
                    altPrio(defaultKey, emptyKey,
                            seq(opt(alt("SORTED", "HASHED")),
                                "KEY",
                                altPrio(seq(Field, opt(alias), "COMPONENTS", components),
                                        components))),
                    optPrio(further),
                    optPrio("READ-ONLY"));

    return key;
  }

}
