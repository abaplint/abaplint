import {IStatement} from "./_statement";
import {verNot, str, seq, opt, alt, per, regex as reg} from "../combi";
import {Source, Constant, FieldChain, Dynamic, Field, FieldLength, FieldSub, RadioGroupName, Modif, TypeName} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Parameter implements IStatement {

  public getMatcher(): IStatementRunnable {
    const para = alt(str("PARAMETER"), str("PARAMETERS"));
    const def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));
    const radio = seq(str("RADIOBUTTON GROUP"), new RadioGroupName());
    const type = seq(alt(str("TYPE"), str("LIKE")), alt(new TypeName(), new Dynamic()));
    const memory = seq(str("MEMORY ID"), new FieldSub());
    const listbox = str("AS LISTBOX");
    const cmd = seq(str("USER-COMMAND"), reg(/^\w+$/));
    const modif = seq(str("MODIF ID"), new Modif());
    const visible = seq(str("VISIBLE LENGTH"), new Constant());
    const length = seq(str("LENGTH"), new Constant());
    const match = seq(str("MATCHCODE OBJECT"), new Field());
    const decimals = seq(str("DECIMALS"), new Source());

    const perm = per(type,
                     def,
                     str("OBLIGATORY"),
                     match,
                     cmd,
                     length,
                     decimals,
                     radio,
                     memory,
                     modif,
                     listbox,
                     visible,
                     str("VALUE CHECK"),
                     str("NO-DISPLAY"),
                     str("AS CHECKBOX"),
                     str("LOWER CASE"));

    const ret = seq(para,
                    new FieldSub(),
                    opt(new FieldLength()),
                    opt(perm));

    return verNot(Version.Cloud, ret);
  }

}