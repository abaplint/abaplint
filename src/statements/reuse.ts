import * as Combi from "../combi";
import {Version} from "../version";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let str = Combi.str;
let opt = Combi.opt;
let tok = Combi.tok;
let ver = Combi.ver;
let re = Combi.reuse;
let star = Combi.star;
let plus = Combi.plus;

export default class Reuse {

  public static integer(): Combi.Reuse {
    let ret = seq(opt(tok("WDash")), reg(/^\d+$/));

    return re(() => { return ret; }, "integer");
  }

  public static typename(): Combi.Reuse {
    let start = reg(/^(\/\w+\/)?\w+$/);
    let after = star(seq(this.arrow_or_dash(), reg(/^\w+$/)));

    let ret = seq(start, after);

    return re(() => { return ret; }, "typename");
  }

  public static field_symbol(): Combi.Reuse {
    let ret = reg(/^<\w+>$/);

    return re(() => { return ret; }, "field_symbol");
  }

  public static inline_decl(): Combi.Reuse {
    let right = alt(tok("ParenRight"), tok("ParenRightW"));
    let left = tok("ParenLeft");
    let data = seq(str("DATA"), left, this.field(), right);
    let fs = seq(str("FIELD-SYMBOL"), left, this.field_symbol(), right);

    let ret = ver(Version.v740sp02, alt(data, fs));

    return re(() => { return ret; }, "inline_decl");
  }

  public static target(): Combi.Reuse {
    return re(() => {
      let after = seq(alt(this.field(), this.field_symbol()),
                      star(seq(this.arrow_or_dash(), this.field())));

      let fields = seq(opt(this.field_offset()), opt(this.field_length()));

      let optional = alt(this.table_body(), fields);

      return alt(this.inline_decl(), seq(after, optional)); },
              "target");
  }

  public static arrow(): Combi.Reuse {
    return re(() => { return reg(/^(->|=>)$/); }, "arrow");
  }

  public static arrow_or_dash(): Combi.Reuse {
    return re(() => { return alt(this.arrow(), tok("Dash")); }, "arrow_or_dash");
  }

  public static parameter_s(): Combi.Reuse {
    return re(() => { return seq(this.field(), str("="), this.source()); }, "parameter_s");
  }

  public static parameter_t(): Combi.Reuse {
    return re(() => { return seq(this.field(), str("="), this.target()); }, "parameter_t");
  }

  public static parameter_list_s(): Combi.Reuse {
    return re(() => { return plus(this.parameter_s()); }, "parameter_list_s");
  }

  public static parameter_list_t(): Combi.Reuse {
    return re(() => { return plus(this.parameter_t()); }, "parameter_list_t");
  }

  public static parameter_exception(): Combi.Reuse {
    return re(() => { return seq(this.field(), str("="), this.integer()); }, "parameter_exception");
  }

  public static parameter_list_exceptions(): Combi.Reuse {
    return re(() => { return plus(this.parameter_exception()); }, "parameter_list_exceptions");
  }

  public static field_or_method_call(): Combi.Reuse {
    return re(() => { return alt(this.field_chain(), this.method_call_chain()); }, "field_or_method_call");
  }

  public static compare(): Combi.Reuse {
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
                  this.source(),
                  alt(seq(operator, this.source()),
                      between,
                      sopt));

    return re(() => { return ret; }, "compare");
  }

  public static cond(): Combi.Reuse {
    let matcher = () => {
      let operator = alt(str("AND"), str("OR"));

      let another = seq(opt(str("NOT")),
                        tok("WParenLeftW"),
                        this.cond(),
                        alt(tok("WParenRightW"), tok("WParenRight")));

      let cnd = alt(this.compare(), another);

      let ret = seq(cnd, star(seq(operator, cnd)));

      return ret; };

    return re(matcher, "cond");
  }

  public static function_parameters(): Combi.Reuse {
    let exporting = seq(str("EXPORTING"), this.parameter_list_s());
    let importing = seq(str("IMPORTING"), this.parameter_list_t());
    let changing = seq(str("CHANGING"), this.parameter_list_t());
    let tables = seq(str("TABLES"), this.parameter_list_t());
    let exceptions = seq(str("EXCEPTIONS"), this.parameter_list_exceptions());
    let long = seq(opt(exporting),
                   opt(importing),
                   opt(tables),
                   opt(changing),
                   opt(exceptions));

    return re(() => { return long; }, "function_parameters");
  }

  public static method_parameters(): Combi.Reuse {
    let exporting = seq(str("EXPORTING"), this.parameter_list_s());
    let importing = seq(str("IMPORTING"), this.parameter_list_t());
    let changing = seq(str("CHANGING"), this.parameter_list_t());
    let receiving = seq(str("RECEIVING"), this.parameter_t());
    let exceptions = seq(str("EXCEPTIONS"), this.parameter_list_exceptions());
    let long = seq(opt(exporting),
                   opt(importing),
                   opt(changing),
                   opt(receiving),
                   opt(exceptions));

    return re(() => { return long; }, "method_parameters");
  }

  public static method_call_chain(): Combi.Reuse {
    let fields = star(seq(this.arrow_or_dash(), this.field()));
    let after = star(seq(fields, this.arrow(), this.method_call()));

    let ret = seq(opt(seq(this.field_chain(), this.arrow())), this.method_call(), after);

    return re(() => { return ret; }, "method_call_chain");
  }

  public static field_offset(): Combi.Reuse {
    let offset = seq(tok("Plus"),
                     reg(/^[\d\w]+$/),
                     opt(seq(this.arrow_or_dash(), this.field())));

    return re(() => { return offset; }, "field_offset");
  }

  public static field_length(): Combi.Reuse {
    let length = seq(tok("ParenLeft"), reg(/^[\d\w]+$/), opt(seq(this.arrow_or_dash(), this.field())), str(")"));

    return re(() => { return length; }, "field_length");
  }

  public static field_chain(): Combi.Reuse {
    let chain = seq(alt(this.field(), this.field_symbol()), star(seq(this.arrow_or_dash(), this.field())));

    let ret = seq(chain, opt(this.field_offset()), opt(this.field_length()));

    return re(() => { return ret; }, "field_chain");
  }

  public static method_name(): Combi.Reuse {
    return re(() => { return reg(/^\w+(~\w+)?$/); }, "method_name");
  }

  public static database_table(): Combi.Reuse {
    return re(() => { return reg(/^\w+$/); }, "database_table");
  }

  public static database_field(): Combi.Reuse {
    return re(() => { return reg(/^\w+$/); }, "database_field");
  }

  public static class_name(): Combi.Reuse {
    return re(() => { return reg(/^\w+$/); }, "class_name");
  }

  public static type_name(): Combi.Reuse {
    return re(() => { return alt(reg(/^\w+$/), str("#")); }, "type_name");
  }

  public static method_call(): Combi.Reuse {
    let ret = seq(this.method_name(),
                  alt(tok("ParenLeftW"), tok("ParenLeft")),
                  alt(this.source(), this.parameter_list_s(), Reuse.method_parameters()),
                  str(")"));

    return re(() => { return ret; }, "method_call");
  }

  public static string_template(): Combi.Reuse {
    return re(() => { return tok("StringTemplate"); }, "string_template");
  }

  public static arith_operator(): Combi.Reuse {
    let ret = alt(tok("WPlusW"),
                  tok("WDashW"),
                  str("*"),
                  str("/"),
                  str("BIT-XOR"),
                  str("BIT-AND"),
                  str("BIT-OR"),
                  str("MOD"));

    return re(() => { return ret; }, "arith_operator");
  }

  public static dynamic(): Combi.Reuse {
    let ret = seq(alt(tok("WParenLeft"), tok("ParenLeft")),
                  alt(this.field_chain(), this.constant()),
                  alt(tok("ParenRightW"), tok("ParenRight")));

    return re(() => { return ret; }, "dynamic");
  }

  public static table_body(): Combi.Reuse {
    let ret = seq(tok("BracketLeft"), alt(tok("BracketRight"), tok("BracketRightW")));

    return re(() => { return ret; }, "table_body");
  }

  public static source(): Combi.Reuse {
    let matcher = () => {
      let method = seq(this.method_call_chain(), opt(seq(this.arrow_or_dash(), this.field_chain())));

// paren used for eg. "( 2 + 1 ) * 4"
      let paren = seq(tok("WParenLeftW"),
                      this.source(),
                      alt(tok("WParenRightW"), tok("WParenRight")));

      let after = seq(alt(str("&"), str("&&"), this.arith_operator()), this.source());
      let ref = seq(this.arrow(), str("*"));

      let boolc = seq(str("BOOLC"), tok("ParenLeftW"), this.cond(), str(")"));

      let old = seq(alt(this.constant(),
                        this.string_template(),
                        boolc,
                        method,
                        this.field_chain(),
                        paren),
                    opt(alt(ref, after, this.table_body())));

      let neww = ver(Version.v740sp02, seq(str("NEW"), this.type_name(), tok("ParenLeftW"), tok("WParenRight")));
      let cast = ver(Version.v740sp02, seq(str("CAST"), this.type_name(), tok("ParenLeftW"), this.source(), tok("WParenRight")));
      let corr = ver(Version.v740sp05, seq(str("CORRESPONDING"), this.type_name(), tok("ParenLeftW"), this.source(), tok("WParenRight")));

      let ret = alt(old, cast, neww, corr);

      return ret; };

    return re(matcher, "source");
  }

  public static field_sub(): Combi.Reuse {
    let ret = seq(reg(/^\w+$/),
                  star(seq(tok("Dash"), reg(/^\w+$/))));

    return re(() => { return ret; }, "field_sub");
  }

  public static field(): Combi.Reuse {
// "&1" can be used for almost anything(field names, method names etc.) in macros
    return re(() => { return reg(/^&?\w+(~\w+)?$/); }, "field");
  }

  public static value(): Combi.Reuse {
    let ret = seq(str("VALUE"), alt(Reuse.constant(), str("IS INITIAL"), Reuse.field_chain()));
    return re(() => { return ret; }, "value");
  }

  public static type(): Combi.Reuse {
    let likeType = alt(str("LIKE"), str("TYPE"));
    let def = seq(str("DEFAULT"), alt(Reuse.constant(), Reuse.field_chain()));
    let length = seq(str("LENGTH"), Reuse.integer());
    let decimals = seq(str("DECIMALS"), Reuse.integer());

    let type = seq(likeType,
                   opt(alt(str("LINE OF"),
                           str("REF TO"),
                           str("RANGE OF"))));

    let ret = seq(type,
                  this.typename(),
                  opt(def),
                  opt(length),
                  opt(decimals));

    return re(() => { return ret; }, "type");
  }

  public static type_table(): Combi.Reuse {

    let likeType = alt(str("LIKE"), str("TYPE"));

    let typetable = seq(likeType,
                        opt(alt(str("STANDARD"), str("HASHED"), str("SORTED"))),
                        str("TABLE"),
                        opt(str("OF")),
                        opt(str("REF TO")));

    let key = seq(str("WITH"),
                  opt(alt(str("NON-UNIQUE"), str("UNIQUE"))),
                  opt(alt(str("DEFAULT"), ver(Version.v740sp02, str("EMPTY")))),
                  str("KEY"),
                  star(this.field_sub()));

    let ret = seq(typetable,
                  opt(this.typename()),
                  opt(key));

    return re(() => { return ret; }, "type_table");
  }

  public static constant(): Combi.Reuse {
    return re(() => {
      let text = seq(tok("ParenLeft"), reg(/^\w{3}$/), alt(tok("ParenRightW"), tok("ParenRight")));
      let stri = seq(reg(/^('.*')|(`.*`)$/), opt(text));
      return alt(stri, this.integer()); },
              "constant");
  }
}