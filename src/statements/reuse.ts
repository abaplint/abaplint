import * as Combi from "../combi";
import {Version} from "../version";

import {Arrow} from "../tokens/";
import {Dash, WDash, WDashW} from "../tokens/";
import {Plus, WPlusW} from "../tokens/";
import {BracketLeft, BracketRight, BracketRightW, BracketLeftW} from "../tokens/";
import {ParenRight, ParenRightW, WParenRight, WParenRightW} from "../tokens/";
import {ParenLeft, ParenLeftW, WParenLeft, WParenLeftW} from "../tokens/";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let str = Combi.str;
let opt = Combi.opt;
let tok = Combi.tok;
let ver = Combi.ver;
// let per = Combi.per;
let star = Combi.star;
let plus = Combi.plus;

export class Integer extends Combi.Reuse {
  public get_runnable() {
    return seq(opt(tok(WDash)), reg(/^\d+$/));
  }
}

export class FieldSymbol extends Combi.Reuse {
  public get_runnable() {
    return reg(/^<\w+>$/);
  }
}

export class InlineData extends Combi.Reuse {
  public get_runnable() {
    let right = alt(tok(ParenRight), tok(ParenRightW));
    let left = tok(ParenLeft);
    let data = seq(str("DATA"), left, new Field(), right);

    return ver(Version.v740sp02, data);
  }
}

export class InlineFS extends Combi.Reuse {
  public get_runnable() {
    let right = alt(tok(ParenRight), tok(ParenRightW));
    let left = tok(ParenLeft);
    let fs = seq(str("FIELD-SYMBOL"), left, new FieldSymbol(), right);

    return ver(Version.v740sp02, fs);
  }
}

export class FSTarget extends Combi.Reuse {
  public get_runnable() {
    return alt(new InlineFS(), new FieldSymbol());
  }
}

export class Target extends Combi.Reuse {
  public get_runnable() {
    let after = seq(alt(new Field(), new FieldSymbol()),
                    star(seq(new ArrowOrDash(), new Field())));

    let fields = seq(opt(new FieldOffset()), opt(new FieldLength()));

    let optional = alt(new TableBody(), fields);

    return alt(new InlineData(), new InlineFS(), seq(after, optional));
  }
}

export class ArrowOrDash extends Combi.Reuse {
  public get_runnable() {
    return alt(tok(Arrow), tok(Dash));
  }
}

export class ParameterS extends Combi.Reuse {
  public get_runnable() {
    return seq(new Field(), str("="), new Source());
  }
}

export class ParameterT extends Combi.Reuse {
  public get_runnable() {
    return seq(new Field(), str("="), new Target());
  }
}

export class ParameterListS extends Combi.Reuse {
  public get_runnable() {
    return plus(new ParameterS());
  }
}

export class ParameterListT extends Combi.Reuse {
  public get_runnable() {
    return plus(new ParameterT());
  }
}

export class ParameterException extends Combi.Reuse {
  public get_runnable() {
    return seq(new Field(),
               str("="),
               reg(/^[\w\d]+$/),
               opt(seq(str("MESSAGE"), new Target())));
  }
}

export class ParameterListExceptions extends Combi.Reuse {
  public get_runnable() {
    return plus(new ParameterException());
  }
}

export class FieldOrMethodCall extends Combi.Reuse {
  public get_runnable() {
    return alt(new FieldChain(), new MethodCallChain());
  }
}

export class Compare extends Combi.Reuse {
  public get_runnable() {
    let operator = seq(opt(str("NOT")),
                       alt(str("="),
                           str("<>"),
                           str("><"),
                           str("<"),
                           str(">"),
                           str("<="),
                           str(">="),
                           str("CA"),
                           str("CO"),
                           str("IN"),
                           str("CP"),
                           str("EQ"),
                           str("NE"),
                           str("CN"),
                           str("GE"),
                           str("GT"),
                           str("LT"),
                           str("LE"),
                           str("CS"),
                           str("NS"),
                           str("NA"),
                           str("NP"),
                           str("O"), // hex comparison operator
                           str("Z"), // hex comparison operator
                           str("M"), // hex comparison operator
                           str("LIKE")));

    let sopt = seq(str("IS"),
                   opt(str("NOT")),
                   alt(str("SUPPLIED"),
                       str("BOUND"),
                       str("REQUESTED"),
                       str("ASSIGNED"),
                       str("INITIAL")));

    let between = seq(str("BETWEEN"), new Source(), str("AND"), new Source());

    let ret = seq(opt(str("NOT")),
                  new Source(),
                  alt(seq(operator, new Source()),
                      between,
                      sopt));

    return ret;
  }
}

export class Cond extends Combi.Reuse {
  public get_runnable() {
    let operator = alt(str("AND"), str("OR"));

    let another = seq(opt(str("NOT")),
                      tok(WParenLeftW),
                      new Cond(),
                      alt(tok(WParenRightW), tok(WParenRight)));

    let cnd = alt(new Compare(), another);

    let ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}

export class MethodParam extends Combi.Reuse {
  public get_runnable() {
    let field = reg(/^!?(\/\w+\/)?\w+$/);
    let type = alt(new Type(), new TypeTable());
    let fieldsOrValue = seq(alt(new PassByValue(), field), type);

    return fieldsOrValue;
  }
}

export class FunctionParameters extends Combi.Reuse {
  public get_runnable() {
    let exporting = seq(str("EXPORTING"), new ParameterListS());
    let importing = seq(str("IMPORTING"), new ParameterListT());
    let changing = seq(str("CHANGING"), new ParameterListT());
    let tables = seq(str("TABLES"), new ParameterListT());
    let exceptions = seq(str("EXCEPTIONS"), alt(new ParameterListExceptions(), new Field()));
    let long = seq(opt(exporting),
                   opt(importing),
                   opt(tables),
                   opt(changing),
                   opt(exceptions));

    return long;
  }
}

export class MethodParameters extends Combi.Reuse {
  public get_runnable() {
    let exporting = seq(str("EXPORTING"), new ParameterListS());
    let importing = seq(str("IMPORTING"), new ParameterListT());
    let changing = seq(str("CHANGING"), new ParameterListT());
    let receiving = seq(str("RECEIVING"), new ParameterT());
    let exceptions = seq(str("EXCEPTIONS"), new ParameterListExceptions());
    let long = seq(opt(exporting),
                   opt(importing),
                   opt(changing),
                   opt(receiving),
                   opt(exceptions));

    return long;
  }
}

export class MethodCallChain extends Combi.Reuse {
  public get_runnable() {
    let fields = star(seq(new ArrowOrDash(), new Field()));
    let after = star(seq(fields, tok(Arrow), new MethodCall()));

    let rparen = alt(tok(WParenRightW), tok(WParenRight));

    let neww = ver(Version.v740sp02, seq(str("NEW"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         opt(alt(new Source(), new ParameterListS())),
                                         rparen));

    let cast = ver(Version.v740sp02, seq(str("CAST"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         new Source(),
                                         rparen));

    let ret = seq(alt(seq(opt(seq(new FieldChain(), tok(Arrow))), new MethodCall()),
                      neww,
                      cast),
                  after);

    return ret;
  }
}

export class FieldOffset extends Combi.Reuse {
  public get_runnable() {
    let offset = seq(tok(Plus),
                     reg(/^[\d\w]+$/),
                     opt(seq(new ArrowOrDash(), new Field())));

    return offset;
  }
}

export class FieldLength extends Combi.Reuse {
  public get_runnable() {
    let normal = seq(reg(/^[\d\w]+$/),
                     opt(seq(new ArrowOrDash(), new Field())));

    let length = seq(tok(ParenLeft),
                     alt(normal, str("*")),
                     alt(tok(ParenRightW), tok(ParenRight)));

    return length;
  }
}

export class FieldChain extends Combi.Reuse {
  public get_runnable() {
    let fcond = seq(new Field(), str("="), new Source());

    let tableExpr = ver(Version.v740sp02,
                        seq(tok(BracketLeftW),
                            alt(new Source(), plus(fcond)),
                            str("]")));

    let chain = seq(alt(new Field(), new FieldSymbol()),
                    opt(tableExpr),
                    star(seq(new ArrowOrDash(), new Field())));

    let ret = seq(chain, opt(new FieldOffset()), opt(new FieldLength()));

    return ret;
  }
}

export class MethodName extends Combi.Reuse {
  public get_runnable() {
    return reg(/^(\/\w+\/)?\w+(~\w+)?$/);
  }
}

export class DatabaseTable extends Combi.Reuse {
  public get_runnable() {
    return reg(/^(\/\w+\/)?\w+$/);
  }
}

export class DatabaseField extends Combi.Reuse {
  public get_runnable() {
    return reg(/^\w+$/);
  }
}

export class SimpleName extends Combi.Reuse {
  public get_runnable() {
    return reg(/^\w+$/);
  }
}

export class ClassName extends Combi.Reuse {
  public get_runnable() {
    return reg(/^(\/\w+\/)?\w+$/);
  }
}

export class FormName extends Combi.Reuse {
  public get_runnable() {
    return seq(reg(/^\w+$/), star(seq(tok(Dash), reg(/^\w+$/))));
  }
}

export class TypeName extends Combi.Reuse {
  public get_runnable() {
    let name = reg(/^(\/\w+\/)?\w+$/);
    let cla = seq(name, tok(Arrow));
    let field = seq(tok(Dash), name);
    return alt(seq(opt(cla), name, opt(field)), str("#"));
  }
}

export class MethodCall extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(new MethodName(),
                  alt(tok(ParenLeftW), tok(ParenLeft)),
                  alt(new Source(), new ParameterListS(), new MethodParameters()),
                  str(")"));

    return ret;
  }
}

export class StringTemplate extends Combi.Reuse {
  public get_runnable() {
    return tok(StringTemplate);
  }
}

export class ArithOperator extends Combi.Reuse {
  public get_runnable() {
    let ret = alt(tok(WPlusW),
                  tok(WDashW),
                  str("*"),
                  str("**"),
                  str("/"),
                  str("BIT-XOR"),
                  str("BIT-AND"),
                  str("BIT-OR"),
                  str("DIV"),
                  str("MOD"));

    return ret;
  }
}

export class Dynamic extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(alt(tok(WParenLeft), tok(ParenLeft)),
                  alt(new FieldChain(), new Constant()),
                  alt(tok(ParenRightW), tok(ParenRight)));

    return ret;
  }
}

export class TableBody extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(tok(BracketLeft), alt(tok(BracketRight), tok(BracketRightW)));
    return ret;
  }
}

export class Source extends Combi.Reuse {
  public get_runnable() {
    let method = seq(new MethodCallChain(), opt(seq(new ArrowOrDash(), new FieldChain())));

    let rparen = alt(tok(WParenRightW), tok(WParenRight));

// paren used for eg. "( 2 + 1 ) * 4"
    let paren = seq(tok(WParenLeftW),
                    new Source(),
                    rparen);

    let after = seq(alt(str("&"), str("&&"), new ArithOperator()), new Source());
    let ref = seq(tok(Arrow), str("*"));

    let boolc = seq(str("BOOLC"), tok(ParenLeftW), new Cond(), str(")"));

    let prefix = alt(tok(WDashW), str("BIT-NOT"));

    let old = seq(alt(new Constant(),
                      new StringTemplate(),
                      boolc,
                      method,
                      seq(opt(prefix), new FieldChain()),
                      paren),
                  opt(alt(ref, after, new TableBody())));

    let mapping = seq(str("MAPPING"), plus(seq(new Field(), str("="), new Field())));

    let corr = ver(Version.v740sp05, seq(str("CORRESPONDING"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         new Source(),
                                         opt(seq(str("EXCEPT"), new Field())),
                                         opt(mapping),
                                         rparen));

    let conv = ver(Version.v740sp02, seq(str("CONV"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         new Source(),
                                         rparen));

    let fieldList = seq(new Field(), str("="), new Source());

    let value = ver(Version.v740sp02, seq(str("VALUE"),
                                          new TypeName(),
                                          tok(ParenLeftW),
                                          opt(alt(new Source(),
                                                  plus(fieldList),
                                                  plus(seq(tok(WParenLeftW), plus(fieldList), tok(WParenRightW))))),
                                          rparen));

    let when = seq(str("WHEN"), new Cond(), str("THEN"), new Source());

    let elsee = seq(str("ELSE"), new Source());

    let cond = ver(Version.v740sp02, seq(str("COND"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         plus(when),
                                         opt(elsee),
                                         rparen));

    let reff = ver(Version.v740sp02, seq(str("REF"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         new Source(),
                                         rparen));

    let ret = alt(old, corr, conv, value, cond, reff);

    return ret;
  }
}

export class FieldSub extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(reg(/^\w+$/),
                  star(seq(tok(Dash), reg(/^\w+$/))));

    return ret;
  }
}

export class IncludeName extends Combi.Reuse {
  public get_runnable() {
    return reg(/^<?(\/\w+\/)?\w+(~\w+)?>?$/);
  }
}

export class MessageClass extends Combi.Reuse {
  public get_runnable() {
// "&1" can be used for almost anything(field names, method names etc.) in macros
    return reg(/^(\/\w+\/)?\w+#?@?$/);
  }
}

export class Field extends Combi.Reuse {
  public get_runnable() {
// "&1" can be used for almost anything(field names, method names etc.) in macros
    return reg(/^&?\*?(\/\w+\/)?\w+(~\w+)?$/);
  }
}

export class PassByValue extends Combi.Reuse {
  public get_runnable() {
    let value = seq(str("VALUE"),
                    tok(ParenLeft),
                    new Field(),
                    alt(tok(ParenRight), tok(ParenRightW)));

    return value;
  }
}

export class Value extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(str("VALUE"), alt(new Constant(), str("IS INITIAL"), new FieldChain()));
    return ret;
  }
}

export class Type extends Combi.Reuse {
  public get_runnable() {
    let likeType = alt(str("LIKE"), str("TYPE"));
    let def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));
    let length = seq(str("LENGTH"), new Source());
    let decimals = seq(str("DECIMALS"), new Integer());

    let type = seq(likeType,
                   opt(alt(str("LINE OF"),
                           str("REF TO"),
                           str("RANGE OF"))));

    let ret = seq(type,
                  new FieldChain(),
                  opt(def),
                  opt(length),
                  opt(decimals),
                  opt(new TableBody()));

    return ret;
  }
}

export class TypeTable extends Combi.Reuse {
  public get_runnable() {
    let likeType = alt(str("LIKE"), str("TYPE"));

    let header = str("WITH HEADER LINE");

    let key = seq(str("WITH"),
                  opt(alt(str("NON-UNIQUE"), str("UNIQUE"))),
                  opt(alt(str("DEFAULT"), ver(Version.v740sp02, str("EMPTY")))),
                  str("KEY"),
                  star(new FieldSub()));

    let typetable = seq(opt(alt(str("STANDARD"), str("HASHED"), str("SORTED"), str("ANY"))),
                        str("TABLE"),
                        opt(str("OF")),
                        opt(str("REF TO")),
                        opt(new TypeName()),
                        opt(header),
                        opt(key));

    let occurs = seq(str("OCCURS"), new Integer());

    let old = seq(new TypeName(),
                  alt(seq(occurs, opt(header)),
                      header));

    let ret = seq(likeType,
                  alt(old, typetable));

    return ret;
  }
}

export class Constant extends Combi.Reuse {
  public get_runnable() {
    let text = seq(tok(ParenLeft), reg(/^\w{3}$/), alt(tok(ParenRightW), tok(ParenRight)));
    let stri = seq(reg(/^('.*')|(`.*`)$/), opt(text));
    return alt(stri, new Integer());
  }
}