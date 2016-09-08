import * as Combi from "../combi";
import {Version} from "../version";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let str = Combi.str;
let opt = Combi.opt;
let tok = Combi.tok;
let ver = Combi.ver;
let star = Combi.star;
let plus = Combi.plus;

export class Integer extends Combi.Reuse {
  public get_runnable() {
    return seq(opt(tok("WDash")), reg(/^\d+$/));
  }
}

// todo, replace with FieldChain?
export class TypeDefName extends Combi.Reuse {
  public get_runnable() {
    let start = reg(/^(\/\w+\/)?\w+$/);
    let after = star(seq(Reuse.arrow_or_dash(), reg(/^\w+$/)));

    return seq(start, after);
  }
}

export class FieldSymbol extends Combi.Reuse {
  public get_runnable() {
    return reg(/^<\w+>$/);
  }
}

export class InlineData extends Combi.Reuse {
  public get_runnable() {
    let right = alt(tok("ParenRight"), tok("ParenRightW"));
    let left = tok("ParenLeft");
    let data = seq(str("DATA"), left, Reuse.field(), right);

    return ver(Version.v740sp02, data);
  }
}

export class InlineFS extends Combi.Reuse {
  public get_runnable() {
    let right = alt(tok("ParenRight"), tok("ParenRightW"));
    let left = tok("ParenLeft");
    let fs = seq(str("FIELD-SYMBOL"), left, Reuse.field_symbol(), right);

    return ver(Version.v740sp02, fs);
  }
}

export class FSTarget extends Combi.Reuse {
  public get_runnable() {
    return alt(Reuse.inline_fs(), Reuse.field_symbol());
  }
}

export class Target extends Combi.Reuse {
  public get_runnable() {
    let after = seq(alt(Reuse.field(), Reuse.field_symbol()),
                    star(seq(Reuse.arrow_or_dash(), Reuse.field())));

    let fields = seq(opt(Reuse.field_offset()), opt(Reuse.field_length()));

    let optional = alt(Reuse.table_body(), fields);

    return alt(Reuse.inline_data(), Reuse.inline_fs(), seq(after, optional));
  }
}

export class Arrow extends Combi.Reuse {
  public get_runnable() {
    return reg(/^(->|=>)$/);
  }
}

export class ArrowOrDash extends Combi.Reuse {
  public get_runnable() {
    return alt(Reuse.arrow(), tok("Dash"));
  }
}

export class ParameterS extends Combi.Reuse {
  public get_runnable() {
    return seq(Reuse.field(), str("="), Reuse.source());
  }
}

export class ParameterT extends Combi.Reuse {
  public get_runnable() {
    return seq(Reuse.field(), str("="), Reuse.target());
  }
}

export class ParameterListS extends Combi.Reuse {
  public get_runnable() {
    return plus(Reuse.parameter_s());
  }
}

export class ParameterListT extends Combi.Reuse {
  public get_runnable() {
    return plus(Reuse.parameter_t());
  }
}

export class ParameterException extends Combi.Reuse {
  public get_runnable() {
    return seq(Reuse.field(),
               str("="),
               Reuse.integer(),
               opt(seq(str("MESSAGE"), Reuse.target())));
  }
}

export class ParameterListExceptions extends Combi.Reuse {
  public get_runnable() {
    return plus(Reuse.parameter_exception());
  }
}

export class FieldOrMethodCall extends Combi.Reuse {
  public get_runnable() {
    return alt(Reuse.field_chain(), Reuse.method_call_chain());
  }
}

export class Compare extends Combi.Reuse {
  public get_runnable() {
    let operator = seq(opt(str("NOT")),
                       alt(str("="),
                           str("<>"),
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
                           str("NP"),
                           str("LIKE")));

    let sopt = seq(str("IS"),
                   opt(str("NOT")),
                   alt(str("SUPPLIED"),
                       str("BOUND"),
                       str("REQUESTED"),
                       str("ASSIGNED"),
                       str("INITIAL")));

    let between = seq(str("BETWEEN"), Reuse.source(), str("AND"), Reuse.source());

    let ret = seq(opt(str("NOT")),
                  Reuse.source(),
                  alt(seq(operator, Reuse.source()),
                      between,
                      sopt));

    return ret;
  }
}

export class Cond extends Combi.Reuse {
  public get_runnable() {
    let operator = alt(str("AND"), str("OR"));

    let another = seq(opt(str("NOT")),
                      tok("WParenLeftW"),
                      Reuse.cond(),
                      alt(tok("WParenRightW"), tok("WParenRight")));

    let cnd = alt(Reuse.compare(), another);

    let ret = seq(cnd, star(seq(operator, cnd)));

    return ret;
  }
}

export class FunctionParameters extends Combi.Reuse {
  public get_runnable() {
    let exporting = seq(str("EXPORTING"), Reuse.parameter_list_s());
    let importing = seq(str("IMPORTING"), Reuse.parameter_list_t());
    let changing = seq(str("CHANGING"), Reuse.parameter_list_t());
    let tables = seq(str("TABLES"), Reuse.parameter_list_t());
    let exceptions = seq(str("EXCEPTIONS"), Reuse.parameter_list_exceptions());
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
    let exporting = seq(str("EXPORTING"), Reuse.parameter_list_s());
    let importing = seq(str("IMPORTING"), Reuse.parameter_list_t());
    let changing = seq(str("CHANGING"), Reuse.parameter_list_t());
    let receiving = seq(str("RECEIVING"), Reuse.parameter_t());
    let exceptions = seq(str("EXCEPTIONS"), Reuse.parameter_list_exceptions());
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
    let fields = star(seq(Reuse.arrow_or_dash(), Reuse.field()));
    let after = star(seq(fields, Reuse.arrow(), Reuse.method_call()));

    let rparen = alt(tok("WParenRightW"), tok("WParenRight"));

    let neww = ver(Version.v740sp02, seq(str("NEW"),
                                         Reuse.type_name(),
                                         tok("ParenLeftW"),
                                         opt(alt(Reuse.source(), Reuse.parameter_list_s())),
                                         rparen));

    let cast = ver(Version.v740sp02, seq(str("CAST"),
                                         Reuse.type_name(),
                                         tok("ParenLeftW"),
                                         Reuse.source(),
                                         rparen));

    let ret = seq(alt(seq(opt(seq(Reuse.field_chain(), Reuse.arrow())), Reuse.method_call()),
                      neww,
                      cast),
                  after);

    return ret;
  }
}

export class FieldOffset extends Combi.Reuse {
  public get_runnable() {
    let offset = seq(tok("Plus"),
                     reg(/^[\d\w]+$/),
                     opt(seq(Reuse.arrow_or_dash(), Reuse.field())));

    return offset;
  }
}

export class FieldLength extends Combi.Reuse {
  public get_runnable() {
    let length = seq(tok("ParenLeft"),
                     reg(/^[\d\w]+$/),
                     opt(seq(Reuse.arrow_or_dash(), Reuse.field())),
                     alt(tok("ParenRightW"), tok("ParenRight")));

    return length;
  }
}

export class FieldChain extends Combi.Reuse {
  public get_runnable() {
    let fcond = seq(Reuse.field(), str("="), Reuse.source());

    let tableExpr = ver(Version.v740sp02, seq(tok("BracketLeftW"),
                                              alt(Reuse.constant(), plus(fcond)),
                                              str("]")));

    let chain = seq(alt(Reuse.field(), Reuse.field_symbol()),
                    opt(tableExpr),
                    star(seq(Reuse.arrow_or_dash(), Reuse.field())));

    let ret = seq(chain, opt(Reuse.field_offset()), opt(Reuse.field_length()));

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

export class ClassName extends Combi.Reuse {
  public get_runnable() {
    return reg(/^(\/\w+\/)?\w+$/);
  }
}

export class FormName extends Combi.Reuse {
  public get_runnable() {
    return seq(reg(/^\w+$/), star(seq(tok("Dash"), reg(/^\w+$/))));
  }
}

export class TypeName extends Combi.Reuse {
  public get_runnable() {
    return alt(reg(/^\w+$/), str("#"));
  }
}

export class MethodCall extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(Reuse.method_name(),
                  alt(tok("ParenLeftW"), tok("ParenLeft")),
                  alt(Reuse.source(), Reuse.parameter_list_s(), Reuse.method_parameters()),
                  str(")"));

    return ret;
  }
}

export class StringTemplate extends Combi.Reuse {
  public get_runnable() {
    return tok("StringTemplate");
  }
}

export class ArithOperator extends Combi.Reuse {
  public get_runnable() {
    let ret = alt(tok("WPlusW"),
                  tok("WDashW"),
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
    let ret = seq(alt(tok("WParenLeft"), tok("ParenLeft")),
                  alt(Reuse.field_chain(), Reuse.constant()),
                  alt(tok("ParenRightW"), tok("ParenRight")));

    return ret;
  }
}

export class TableBody extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(tok("BracketLeft"), alt(tok("BracketRight"), tok("BracketRightW")));

    return ret;
  }
}

export class Source extends Combi.Reuse {
  public get_runnable() {
    let method = seq(Reuse.method_call_chain(), opt(seq(Reuse.arrow_or_dash(), Reuse.field_chain())));

    let rparen = alt(tok("WParenRightW"), tok("WParenRight"));

// paren used for eg. "( 2 + 1 ) * 4"
    let paren = seq(tok("WParenLeftW"),
                    Reuse.source(),
                    rparen);

    let after = seq(alt(str("&"), str("&&"), Reuse.arith_operator()), Reuse.source());
    let ref = seq(Reuse.arrow(), str("*"));

    let boolc = seq(str("BOOLC"), tok("ParenLeftW"), Reuse.cond(), str(")"));

    let prefix = alt(tok("WDashW"), str("BIT-NOT"));

    let old = seq(alt(Reuse.constant(),
                      Reuse.string_template(),
                      boolc,
                      method,
                      seq(opt(prefix), Reuse.field_chain()),
                      paren),
                  opt(alt(ref, after, Reuse.table_body())));

    let corr = ver(Version.v740sp05, seq(str("CORRESPONDING"),
                                         Reuse.type_name(),
                                         tok("ParenLeftW"),
                                         Reuse.source(),
                                         rparen));

    let conv = ver(Version.v740sp02, seq(str("CONV"),
                                         Reuse.type_name(),
                                         tok("ParenLeftW"),
                                         Reuse.source(),
                                         rparen));

    let fieldList = seq(Reuse.field(), str("="), Reuse.source());

    let value = ver(Version.v740sp02, seq(str("VALUE"),
                                          Reuse.type_name(),
                                          tok("ParenLeftW"),
                                          alt(Reuse.source(),
                                              plus(fieldList),
                                              plus(seq(tok("WParenLeftW"), plus(fieldList), tok("WParenRightW")))),
                                          rparen));

    let when = seq(str("WHEN"), Reuse.cond(), str("THEN"), Reuse.source());

    let elsee = seq(str("ELSE"), Reuse.source());

    let cond = ver(Version.v740sp02, seq(str("COND"),
                                         Reuse.type_name(),
                                         tok("ParenLeftW"),
                                         plus(when),
                                         opt(elsee),
                                         rparen));

    let reff = ver(Version.v740sp02, seq(str("REF"),
                                         Reuse.type_name(),
                                         tok("ParenLeftW"),
                                         Reuse.source(),
                                         rparen));

    let ret = alt(old, corr, conv, value, cond, reff);

    return ret;
  }
}

export class FieldSub extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(reg(/^\w+$/),
                  star(seq(tok("Dash"), reg(/^\w+$/))));

    return ret;
  }
}

export class Field extends Combi.Reuse {
  public get_runnable() {
// "&1" can be used for almost anything(field names, method names etc.) in macros
    return reg(/^&?(\/\w+\/)?\w+(~\w+)?$/);
  }
}

export class Value extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(str("VALUE"), alt(Reuse.constant(), str("IS INITIAL"), Reuse.field_chain()));
    return ret;
  }
}

export class PassByValue extends Combi.Reuse {
  public get_runnable() {
    let ret = seq(str("VALUE"),
                  tok("ParenLeft"),
                  Reuse.field(),
                  tok("ParenRightW"));
    return ret;
  }
}

export class Type extends Combi.Reuse {
  public get_runnable() {
    let likeType = alt(str("LIKE"), str("TYPE"));
    let def = seq(str("DEFAULT"), alt(Reuse.constant(), Reuse.field_chain()));
    let length = seq(str("LENGTH"), Reuse.integer());
    let decimals = seq(str("DECIMALS"), Reuse.integer());

    let type = seq(likeType,
                   opt(alt(str("LINE OF"),
                           str("REF TO"),
                           str("RANGE OF"))));

    let ret = seq(type,
                  Reuse.field_chain(),
                  opt(def),
                  opt(length),
                  opt(decimals));

    return ret;
  }
}

export class TypeTable extends Combi.Reuse {
  public get_runnable() {
    let likeType = alt(str("LIKE"), str("TYPE"));

    let typetable = seq(likeType,
                        opt(alt(str("STANDARD"), str("HASHED"), str("SORTED"), str("ANY"))),
                        str("TABLE"),
                        opt(str("OF")),
                        opt(str("REF TO")));

    let key = seq(str("WITH"),
                  opt(alt(str("NON-UNIQUE"), str("UNIQUE"))),
                  opt(alt(str("DEFAULT"), ver(Version.v740sp02, str("EMPTY")))),
                  str("KEY"),
                  star(Reuse.field_sub()));

    let ret = seq(typetable,
                  opt(Reuse.typename()),
                  opt(key));

    return ret;
  }
}

export class Constant extends Combi.Reuse {
  public get_runnable() {
    let text = seq(tok("ParenLeft"), reg(/^\w{3}$/), alt(tok("ParenRightW"), tok("ParenRight")));
    let stri = seq(reg(/^('.*')|(`.*`)$/), opt(text));
    return alt(stri, Reuse.integer());
  }
}

// todo, remove this class
export default class Reuse {
  public static string_template(): Combi.Reuse { return new StringTemplate(); }
  public static arith_operator(): Combi.Reuse { return new ArithOperator(); }
  public static dynamic(): Combi.Reuse { return new Dynamic(); }
  public static table_body(): Combi.Reuse { return new TableBody(); }
  public static source(): Combi.Reuse { return new Source(); }
  public static field_sub(): Combi.Reuse { return new FieldSub(); }
  public static field(): Combi.Reuse { return new Field(); }
  public static value(): Combi.Reuse { return new Value(); }
  public static pass_by_value(): Combi.Reuse { return new PassByValue(); }
  public static type(): Combi.Reuse { return new Type(); }
  public static type_table(): Combi.Reuse { return new TypeTable(); }
  public static constant(): Combi.Reuse { return new Constant(); }
  public static typename(): Combi.Reuse { return new TypeDefName(); }
  public static field_symbol(): Combi.Reuse { return new FieldSymbol(); }
  public static inline_data(): Combi.Reuse { return new InlineData(); }
  public static inline_fs(): Combi.Reuse { return new InlineFS(); }
  public static fs_target(): Combi.Reuse { return new FSTarget(); }
  public static target(): Combi.Reuse { return new Target(); }
  public static arrow(): Combi.Reuse { return new Arrow(); }
  public static arrow_or_dash(): Combi.Reuse { return new ArrowOrDash(); }
  public static parameter_s(): Combi.Reuse { return new ParameterS(); }
  public static parameter_t(): Combi.Reuse { return new ParameterT(); }
  public static parameter_list_s(): Combi.Reuse { return new ParameterListS(); }
  public static parameter_list_t(): Combi.Reuse { return new ParameterListT(); }
  public static parameter_exception(): Combi.Reuse { return new ParameterException(); }
  public static integer(): Combi.Reuse { return new Integer(); }
  public static parameter_list_exceptions(): Combi.Reuse { return new ParameterListExceptions(); }
  public static field_or_method_call(): Combi.Reuse { return new FieldOrMethodCall(); }
  public static compare(): Combi.Reuse { return new Compare(); }
  public static cond(): Combi.Reuse { return new Cond(); }
  public static function_parameters(): Combi.Reuse { return new FunctionParameters(); }
  public static method_parameters(): Combi.Reuse { return new MethodParameters(); }
  public static method_call_chain(): Combi.Reuse { return new MethodCallChain(); }
  public static field_offset(): Combi.Reuse { return new FieldOffset(); }
  public static field_length(): Combi.Reuse { return new FieldLength(); }
  public static field_chain(): Combi.Reuse { return new FieldChain(); }
  public static method_name(): Combi.Reuse { return new MethodName(); }
  public static database_table(): Combi.Reuse { return new DatabaseTable(); }
  public static database_field(): Combi.Reuse { return new DatabaseField(); }
  public static class_name(): Combi.Reuse { return new ClassName(); }
  public static form_name(): Combi.Reuse { return new FormName(); }
  public static type_name(): Combi.Reuse { return new TypeName(); }
  public static method_call(): Combi.Reuse { return new MethodCall(); }
}
