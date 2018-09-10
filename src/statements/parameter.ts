import {Statement} from "./statement";
import * as Reuse from "./reuse";
import {str, seq, opt, alt, per, regex as reg, IRunnable} from "../combi";

export class Parameter extends Statement {

  public static get_matcher(): IRunnable {
    let para = alt(str("PARAMETER"), str("PARAMETERS"));
    let def = seq(str("DEFAULT"), alt(new Reuse.Constant(), new Reuse.FieldChain()));
    let radio = seq(str("RADIOBUTTON GROUP"), new Reuse.RadioGroupName());
    let type = seq(alt(str("TYPE"), str("LIKE")), alt(new Reuse.FieldChain(), new Reuse.Dynamic()));
    let memory = seq(str("MEMORY ID"), new Reuse.Field());
    let listbox = str("AS LISTBOX");
    let cmd = seq(str("USER-COMMAND"), reg(/^\w+$/));
    let modif = seq(str("MODIF ID"), new Reuse.Modif());
    let visible = seq(str("VISIBLE LENGTH"), new Reuse.Constant());
    let length = seq(str("LENGTH"), new Reuse.Constant());
    let match = seq(str("MATCHCODE OBJECT"), new Reuse.Field());
    let decimals = seq(str("DECIMALS"), new Reuse.Source());

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
                  new Reuse.FieldSub(),
                  opt(new Reuse.FieldLength()),
                  opt(perm));

    return ret;
  }

}