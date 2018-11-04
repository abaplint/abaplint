import {Statement} from "./_statement";
import {verNot, str, seq, opt, alt, per, regex as reg, IRunnable} from "../combi";
import {Source, Constant, FieldChain, Dynamic, Field, FieldLength, FieldSub, RadioGroupName, Modif} from "../expressions";
import {Version} from "../../version";

export class Parameter extends Statement {

  public getMatcher(): IRunnable {
    let para = alt(str("PARAMETER"), str("PARAMETERS"));
    let def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));
    let radio = seq(str("RADIOBUTTON GROUP"), new RadioGroupName());
    let type = seq(alt(str("TYPE"), str("LIKE")), alt(new FieldChain(), new Dynamic()));
    let memory = seq(str("MEMORY ID"), new FieldSub());
    let listbox = str("AS LISTBOX");
    let cmd = seq(str("USER-COMMAND"), reg(/^\w+$/));
    let modif = seq(str("MODIF ID"), new Modif());
    let visible = seq(str("VISIBLE LENGTH"), new Constant());
    let length = seq(str("LENGTH"), new Constant());
    let match = seq(str("MATCHCODE OBJECT"), new Field());
    let decimals = seq(str("DECIMALS"), new Source());

    let perm = per(type,
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

    let ret = seq(para,
                  new FieldSub(),
                  opt(new FieldLength()),
                  opt(perm));

    return verNot(Version.Cloud, ret);
  }

}