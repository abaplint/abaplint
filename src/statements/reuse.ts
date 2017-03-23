import * as Combi from "../combi";
import {Version} from "../version";

import {Arrow} from "../tokens/";
import {Dash, WDash, WDashW} from "../tokens/";
import {Plus, WPlusW, WAt} from "../tokens/";
import {BracketLeft, BracketRight, BracketRightW, BracketLeftW} from "../tokens/";
import {ParenRight, ParenRightW, WParenRight, WParenRightW} from "../tokens/";
import {ParenLeft, ParenLeftW, WParenLeft, WParenLeftW} from "../tokens/";
import {WBracketRight, WBracketRightW} from "../tokens/";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let str = Combi.str;
let opt = Combi.opt;
let tok = Combi.tok;
let ver = Combi.ver;
let per = Combi.per;
let optPrio = Combi.optPrio;
let altPrio = Combi.altPrio;
let star = Combi.star;
let plus = Combi.plus;

export class Integer extends Combi.Reuse {
  public get_runnable() {
    return seq(opt(tok(WDash)), reg(/^\d+$/));
  }
}

export class FieldSymbol extends Combi.Reuse {
  public get_runnable() {
    return reg(/^<[\w\/]+>$/);
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
                    opt(new TableExpression()),
                    star(seq(new ArrowOrDash(), alt(str("*"), new FieldAll()), opt(new TableExpression()))));

    let fields = seq(opt(new FieldOffset()), opt(new FieldLength()));

    let ref = seq(tok(Arrow), str("*"));

    let optional = alt(new TableBody(), fields, ref);

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
//               alt(new Constant, new FieldSub(), new FieldChain()),
               new SimpleName(),
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
    let val = alt(new FieldSub(), new Constant());

    let list = seq(tok(WParenLeft),
                   val,
                   plus(seq(str(","), val)),
                   alt(tok(ParenRightW), tok(ParenRight)));

    let inn = seq(opt(str("NOT")), str("IN"), alt(new Source(), list));

    let operator = seq(opt(str("NOT")),
                       alt(str("="),
                           str("<>"),
                           str("><"),
                           str("<"),
                           str(">"),
                           str("<="),
                           str(">="),
                           str("=>"),
                           str("=<"),
                           str("CA"),
                           str("CO"),
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
                           str("BYTE-CO"),
                           str("BYTE-CA"),
                           str("BYTE-CS"),
                           str("BYTE-CN"),
                           str("BYTE-NA"),
                           str("BYTE-NS"),
                           str("O"), // hex comparison operator
                           str("Z"), // hex comparison operator
                           str("M")));

    let sopt = seq(str("IS"),
                   opt(str("NOT")),
                   alt(str("SUPPLIED"),
                       str("BOUND"),
                       str("REQUESTED"),
                       str("ASSIGNED"),
                       str("INITIAL")));

    let between = seq(opt(str("NOT")), str("BETWEEN"), new Source(), str("AND"), new Source());

    let predicate = ver(Version.v740sp08, new MethodCallChain());

    let rett = seq(new Source(),
                   alt(seq(operator, new Source()),
                       inn,
                       between,
                       sopt));

    let ret = seq(opt(str("NOT")), alt(predicate, rett));

    return ret;
  }
}

export class SQLFieldName extends Combi.Reuse {
  public get_runnable() {
    return reg(/^[\w~]+$/);
  }
}

export class SQLCompare extends Combi.Reuse {
  public get_runnable() {
    let val = alt(new FieldSub(), new Constant());

    let list = seq(tok(WParenLeft),
                   val,
                   plus(seq(str(","), val)),
                   alt(tok(ParenRightW), tok(ParenRight)));

    let subSelect = seq(str("("), new Select(), str(")"));

    let inn = seq(opt(str("NOT")), str("IN"), alt(new Source(), list, subSelect));

    let operator = alt(str("="),
                       str("<>"),
                       str("><"),
                       str("<"),
                       str(">"),
                       str("<="),
                       str(">="),
                       str("EQ"),
                       str("NE"),
                       str("GE"),
                       str("GT"),
                       str("LT"),
                       str("LE"));

    let between = seq(str("BETWEEN"), new Source(), str("AND"), new Source());

    let like = seq(opt(str("NOT")), str("LIKE"), new Source(), optPrio(seq(str("ESCAPE"), new Source())));

    let nul = seq(str("IS"), opt(str("NOT")), str("NULL"));

    let rett = seq(new SQLFieldName(),
                   alt(seq(operator, opt(ver(Version.v740sp05, tok(WAt))), new Source()),
                       inn,
                       like,
                       between,
                       nul));

    let ret = rett;

    let exists = seq(str("EXISTS"), subSelect);

    return alt(ret, new Dynamic(), exists);
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

export class SQLCond extends Combi.Reuse {
  public get_runnable() {
    let operator = alt(str("AND"), str("OR"));

    let paren = seq(tok(WParenLeftW),
                    new SQLCond(),
                    alt(tok(WParenRightW), tok(WParenRight)));

    let cnd = seq(optPrio(str("NOT")), alt(new SQLCompare(), paren));

    let ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}

export class FormParamType extends Combi.Reuse {
  public get_runnable() {
    let def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));

    let table = seq(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY")),
                    str("TABLE"));

    let tabseq = seq(table, optPrio(seq(str("OF"), new TypeName)));

    let ret = seq(optPrio(str("REF TO")),
                  new TypeName(),
                  opt(def));

    let like = seq(str("LIKE"), new FieldChain());

    return alt(seq(str("TYPE"), altPrio(tabseq, ret)), like);
  }
}

export class FormParam extends Combi.Reuse {
  public get_runnable() {
//    let fieldName = seq(reg(/^\w+$/), optPrio(seq(tok(Dash), reg(/^\w+$/))));
    let name = reg(/^\w+$/);
//    let dashed = seq(reg(/^\w+$/), tok(Dash), reg(/^\w+$/));
    let field = seq(altPrio(new PassByValue(), name),
                    optPrio(new FormParamType));

    return field;
  }
}

export class MethodParam extends Combi.Reuse {
  public get_runnable() {
    let field = reg(/^!?(\/\w+\/)?\w+$/);
    let fieldsOrValue = seq(alt(new PassByValue(), field), new TypeParam());

    return fieldsOrValue;
  }
}

export class ReceiveParameters extends Combi.Reuse {
  public get_runnable() {
    let importing = seq(str("IMPORTING"), new ParameterListT());
    let tables = seq(str("TABLES"), new ParameterListT());
    let changing = seq(str("CHANGING"), new ParameterListT());
    let exceptions = seq(str("EXCEPTIONS"), opt(new ParameterListExceptions()), opt(new Field()));
    let long = seq(opt(importing),
                   opt(changing),
                   opt(tables),
                   opt(exceptions));

    return long;
  }
}

export class FunctionParameters extends Combi.Reuse {
  public get_runnable() {
    let exporting = seq(str("EXPORTING"), new ParameterListS());
    let importing = seq(str("IMPORTING"), new ParameterListT());
    let changing = seq(str("CHANGING"), new ParameterListT());
    let tables = seq(str("TABLES"), new ParameterListT());
    let exceptions = seq(str("EXCEPTIONS"), opt(alt(new ParameterListExceptions(), new Field())));
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
                     alt(reg(/^[\d\w]+$/), new FieldSymbol()),
                     opt(seq(new ArrowOrDash(), new Field())));

    return offset;
  }
}

export class FieldLength extends Combi.Reuse {
  public get_runnable() {
    let normal = seq(alt(reg(/^[\d\w]+$/), new FieldSymbol()),
                     opt(seq(new ArrowOrDash(), new Field())));

    let length = seq(tok(ParenLeft),
                     alt(normal, str("*")),
                     alt(tok(ParenRightW), tok(ParenRight)));

    return length;
  }
}

export class FieldChain extends Combi.Reuse {
  public get_runnable() {

    let chain = seq(alt(new Field(), new FieldSymbol()),
                    optPrio(new TableExpression()),
                    star(seq(new ArrowOrDash(), alt(str("*"), new FieldAll()), opt(new TableExpression()))));

    let ret = seq(chain, optPrio(new FieldOffset()), optPrio(new FieldLength()));

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

export class RadioGroupName extends Combi.Reuse {
  public get_runnable() {
    return reg(/^[\w\d%]+$/);
  }
}

export class SimpleName extends Combi.Reuse {
  public get_runnable() {
    return reg(/^[\w%]+$/);
  }
}

export class NamespaceSimpleName extends Combi.Reuse {
  public get_runnable() {
    return reg(/^((\w*\/\w+\/)|(\w*\/\w+\/)?[\w%]+)$/);
  }
}

export class ClassName extends Combi.Reuse {
  public get_runnable() {
    return reg(/^\w*(\/\w{3,}\/)?\w+$/);
  }
}

export class MacroName extends Combi.Reuse {
  public get_runnable() {
    return seq(reg(/^[\w%][\w\*]*>?$/), star(seq(tok(Dash), reg(/^\w+$/))));
  }
}

export class FormName extends Combi.Reuse {
  public get_runnable() {
    return seq(reg(/^[\w%\/][\w\*\/]*$/), star(seq(tok(Dash), opt(reg(/^\w+$/)))));
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
    let white = seq(tok(ParenLeftW), alt(new Source(), new ParameterListS(), new MethodParameters()));
    let noWhite = seq(tok(ParenLeft), new ConstantString());

    let ret = seq(new MethodName(),
                  alt(white, noWhite),
                  str(")"));

    return ret;
  }
}

export class StringTemplate extends Combi.Reuse {
  public get_runnable() {
    return ver(Version.v702, tok(StringTemplate));
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

export class TableExpression extends Combi.Reuse {
  public get_runnable() {
    let fields = plus(seq(new Field(), str("="), new Source()));
    let key = seq(str("KEY"), new Field());
    let ret = seq(tok(BracketLeftW),
                  alt(new Source(), seq(opt(key), fields)),
                  alt(tok(WBracketRight),
                      tok(WBracketRightW)));
    return ver(Version.v740sp02, ret);
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
    let ref = seq(tok(Arrow), str("*"));

    let method = seq(new MethodCallChain(), optPrio(seq(new ArrowOrDash(), new FieldChain())));

    let rparen = alt(tok(WParenRightW), tok(WParenRight));

// paren used for eg. "( 2 + 1 ) * 4"
    let paren = seq(tok(WParenLeftW),
                    new Source(),
                    rparen);

    let after = seq(alt(str("&"), str("&&"), new ArithOperator()), new Source());

    let bool = seq(alt(ver(Version.v702, str("BOOLC")),
                       ver(Version.v740sp08, str("XSDBOOL"))),
                   tok(ParenLeftW),
                   new Cond(),
                   str(")"));

    let prefix = alt(tok(WDashW), str("BIT-NOT"));

    let old = seq(alt(new Constant(),
                      new StringTemplate(),
                      bool,
                      method,
                      seq(opt(prefix), new FieldChain()),
                      paren),
                  optPrio(alt(ref, after, new TableBody())));

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

    let swhen = seq(str("WHEN"), new Source(), str("THEN"), new Source());
    let swit = ver(Version.v740sp02, seq(str("SWITCH"),
                                         new TypeName(),
                                         tok(ParenLeftW),
                                         new Source(),
                                         plus(swhen),
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

    let ret = alt(old, corr, conv, value, cond, reff, swit);

    return ret;
  }
}

export class Modif extends Combi.Reuse {
  public get_runnable() {
    return reg(/^\w{1,3}$/);
  }
}

export class FieldSub extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(reg(/^(\/\w+\/)?\w+$/),
                  star(seq(tok(Dash), reg(/^\w+$/))));

    return ret;
  }
}

export class IncludeName extends Combi.Reuse {
  public get_runnable() {
    return seq(reg(/^<?(\/\w+\/)?\w+(~\w+)?>?$/), opt(seq(tok(Dash), reg(/^\w+$/))));
  }
}

export class MessageClass extends Combi.Reuse {
  public get_runnable() {
// "&1" can be used for almost anything(field names, method names etc.) in macros
    return reg(/^>?(\/\w+\/)?\w+#?@?\/?!?&?>?$/);
  }
}

export class FieldAll extends Combi.Reuse {
  public get_runnable() {
// "&1" can be used for almost anything(field names, method names etc.) in macros
// field names with only digits should not be possible
    return reg(/^&?\*?(\/\w+\/)?\w+(~\w+)?$/);
  }
}

export class Field extends Combi.Reuse {
  public get_runnable() {
// "&1" can be used for almost anything(field names, method names etc.) in macros
// field names with only digits should not be possible
    return reg(/^[&_]?\*?\w*(\/\w+\/)?\d*[a-zA-Z_%][\w\*%]*(~\w+)?$/);
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
    let ret = seq(str("VALUE"), alt(new Source(), str("IS INITIAL")));
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

export class TypeParam extends Combi.Reuse {
  public get_runnable() {
    let def = seq(str("DEFAULT"), alt(new Constant(), new FieldChain()));

    let table = seq(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY")),
                    str("TABLE"));

    let ret = seq(opt(seq(table, str("OF"))),
                  opt(str("REF TO")),
                  new TypeName(),
                  opt(def));

    let like = seq(str("LIKE"), new FieldChain());

    return alt(seq(str("TYPE"), alt(table, ret)), like);
  }
}

export class TypeTable extends Combi.Reuse {
  public get_runnable() {
    let likeType = alt(str("LIKE"), str("TYPE"));
    let header = str("WITH HEADER LINE");
    let initial = seq(str("INITIAL SIZE"), new Constant());

    let key = seq(str("WITH"),
                  opt(alt(str("NON-UNIQUE"), str("UNIQUE"))),
                  opt(alt(str("DEFAULT"), str("SORTED"), ver(Version.v740sp02, str("EMPTY")))),
                  str("KEY"),
                  star(new FieldSub()));

    let typetable = seq(opt(alt(str("STANDARD"), str("HASHED"), str("INDEX"), str("SORTED"), str("ANY"))),
                        str("TABLE"),
                        opt(str("OF")),
                        opt(str("REF TO")),
                        opt(new TypeName()),
                        opt(header),
                        opt(initial),
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

export class ConstantString extends Combi.Reuse {
  public get_runnable() {
    let text = seq(tok(ParenLeft), reg(/^\w{3}$/), alt(tok(ParenRightW), tok(ParenRight)));
    /*
    let constant = reg(/^('.*')|(`.*`)$/);
    let concat = seq(str("&"), constant);
    let stri = seq(constant, star(concat), opt(text));
    */
    let stri = seq(reg(/^('.*')|(`.*`)$/), opt(text));
    return stri;
  }
}

export class Constant extends Combi.Reuse {
  public get_runnable() {
    return alt(new ConstantString(), new Integer());
  }
}

export class SQLJoin extends Combi.Reuse {
  public get_runnable() {
    let aas = seq(str("AS"), new Field());

    let joinType = seq(opt(alt(str("INNER"), str("LEFT OUTER"), str("LEFT"))), str("JOIN"));

    let join = seq(joinType,
                   new DatabaseTable(),
                   opt(aas),
                   str("ON"),
                   plus(new SQLCond()));

    return join;
  }
}

export class Select extends Combi.Reuse {
  public get_runnable() {

    let aas = seq(str("AS"), new Field());

    let from = seq(str("FROM"),
                   opt(tok(WParenLeftW)),
                   alt(new Dynamic(), new DatabaseTable()),
                   opt(aas));

    let intoList = seq(tok(WParenLeft),
                       star(seq(new Target(), str(","))),
                       new Target(),
                       str(")"));
    let intoSimple = seq(opt(str("CORRESPONDING FIELDS OF")),
                         opt(ver(Version.v740sp05, tok(WAt))),
                         new Target());

    let intoTable = seq(alt(str("INTO"), str("APPENDING")),
                        opt(str("CORRESPONDING FIELDS OF")),
                        str("TABLE"),
                        opt(ver(Version.v740sp05, tok(WAt))),
                        new Target());


    let into = alt(seq(str("INTO"), alt(intoList, intoSimple)), intoTable);

    let pack = seq(str("PACKAGE SIZE"), new Source());

    let connection = seq(str("CONNECTION"), new Dynamic());

    let where = seq(str("WHERE"), new SQLCond());

    let order = seq(str("ORDER BY"), alt(plus(new Field()), str("PRIMARY KEY"), new Dynamic()));

    let forAll = seq(str("FOR ALL ENTRIES IN"), new Source());

    let count = seq(str("COUNT"), alt(tok(ParenLeft), tok(ParenLeftW)), opt(str("DISTINCT")), alt(str("*"), new Field()), str(")"));
    let max = seq(str("MAX"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    let min = seq(str("MIN"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));
    let sum = seq(str("SUM"), alt(tok(ParenLeft), tok(ParenLeftW)), new Field(), str(")"));

    let fields = alt(str("*"),
                     new Dynamic(),
                     plus(alt(new Field(), count, max, min, sum)));

    let up = seq(str("UP TO"), new Source(), str("ROWS"));

    let client = str("CLIENT SPECIFIED");
    let bypass = str("BYPASSING BUFFER");

    let source = seq(from, star(new SQLJoin()), opt(tok(WParenRightW)));

    let group = seq(str("GROUP BY"), alt(new Field(), new Dynamic()));

    let perm = per(source, into, forAll, where, order, up, client, bypass, pack, group, connection);

    let ret = seq(str("SELECT"),
                  alt(str("DISTINCT"), opt(seq(str("SINGLE"), opt(str("FOR UPDATE"))))),
                  fields,
                  perm);

    return ret;
  }
}