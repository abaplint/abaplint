import * as Combi from "../combi";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let str = Combi.str;
let opt = Combi.opt;
let re = Combi.reuse;
let star = Combi.star;
let plus = Combi.plus;

export default class Reuse {

  public static integer(): Combi.Reuse {
    return re(() => { return reg(/^\d+$/); }, "integer");
  }

  public static typename(): Combi.Reuse {
    return re(() => {
      let start = reg(/^(\/\w+\/)?\w+$/);
      let after = star(seq(this.arrow_or_dash(), reg(/^\w+$/)));
      return seq(start, after); },
              "typename");
  }

  public static field_symbol(): Combi.Reuse {
    return re(() => { return reg(/^<\w+>$/); }, "field_symbol");
  }

  public static inline_decl(): Combi.Reuse {
    return re(() => {
      let data = seq(str("DATA"), str("("), this.field(), str(")"));
      let fs = seq(str("FIELD-SYMBOL"), str("("), this.field_symbol(), str(")"));
      return alt(data, fs); },
              "inline_decl");
  }

  public static target(): Combi.Reuse {
    return re(() => {
      let after = seq(alt(this.field(), this.field_symbol()),
                      star(seq(this.arrow_or_dash(), this.field())));
      return alt(this.inline_decl(), after); },
              "target");
  }

  public static arrow(): Combi.Reuse {
    return re(() => { return reg(/^(->|=>)$/); }, "arrow");
  }

  public static arrow_or_dash(): Combi.Reuse {
    return re(() => { return reg(/^(->|=>|-)$/); }, "arrow_or_dash");
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
    return re(() => { return alt(this.field_offset(), this.method_call_chain()); }, "field_or_method_call");
  }

  public static cond(): Combi.Reuse {
// todo
    return re(() => { return star(reg(/.*/)); }, "cond");
  }

  public static function_parameters(): Combi.Reuse {
    let exporting = seq(str("EXPORTING"), this.parameter_list_s());
    let importing = seq(str("IMPORTING"), this.parameter_list_t());
    let changing = seq(str("CHANGING"), this.parameter_list_t());
    let tables = seq(str("TABLES"), this.parameter_list_t());
    let exceptions = seq(str("EXCEPTIONS"), this.parameter_list_exceptions());
    let long = seq(opt(exporting),
                   opt(importing),
                   opt(changing),
                   opt(tables),
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
    let after = star(seq(this.arrow_or_dash(), this.method_call()));

    let ret = seq(opt(seq(this.field_chain(), this.arrow())), this.method_call(), after);

    return re(() => { return ret; }, "method_call_chain");
  }

  public static field_symbol_offset(): Combi.Reuse {
    return re(() => { return reg(/^<\w+>(\+\d+)?$/); }, "field_symbol_offset");
  }

  public static field_chain(): Combi.Reuse {
    let ret = seq(alt(this.field(), this.field_symbol()), opt(seq(this.arrow_or_dash(), this.field())));

    return re(() => { return alt(ret, this.field_offset(), this.field_symbol_offset()); }, "field_chain");
  }

  public static method_call(): Combi.Reuse {
    let ret = seq(this.field(), str("("),
                  alt(this.source(), this.parameter_list_s(), Reuse.method_parameters()), str(")"));

    return re(() => { return ret; }, "method_call");
  }

  public static string_template(): Combi.Reuse {
    return re(() => { return reg(/^\|.*\|$/); }, "string_template");
  }

  public static arith_operator(): Combi.Reuse {
    return re(() => { return reg(/^[+\-\*\/]$/); }, "arith_operator");
  }

  public static source(): Combi.Reuse {
    let matcher = () => {
      let single = alt(this.method_call_chain(), this.field_chain());
      return seq(alt(this.constant(), this.string_template(), single),
                 opt(seq(alt(str("&&"), this.arith_operator()), this.source()))); };

    return re(matcher, "source");
  }

  public static field_sub(): Combi.Reuse {
    return re(() => { return seq(reg(/^\w+$/), star(seq(reg(/^-$/), reg(/^\w+$/)))); }, "field_sub");
  }

  public static field(): Combi.Reuse {
    return re(() => { return reg(/^\w+$/); }, "field");
  }

  public static field_offset(): Combi.Reuse {
// todo, handle "foo+3(4)" better than the following, see issue #58
    return re(() => { return seq(reg(/^\w+(\+[\d\w]+)$/), opt(seq(str("("), reg(/[\d\w]+/), str(")")))); }, "field_offset");
  }

  public static constant(): Combi.Reuse {
    return re(() => {
      let stri = reg(/^('.*')|(`.*`)$/);
      return alt(stri, this.integer()); },
              "constant");
  }
}