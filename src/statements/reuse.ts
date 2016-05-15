import * as Combi from "../combi";

let reg = Combi.regex;
let seq = Combi.seq;
let alt = Combi.alt;
let str = Combi.str;
let opt = Combi.opt;
let re = Combi.reuse;
let star = Combi.star;

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

    public static field_symbol_offset(): Combi.Reuse {
        return re(() => { return reg(/^<\w+>(\+\d+)?$/); }, "field_symbol_offset");
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
        return re(() => { return seq(this.parameter_s(), star(this.parameter_s())); }, "parameter_list_s");
    }

    public static parameter_list_t(): Combi.Reuse {
        return re(() => { return seq(this.parameter_t(), star(this.parameter_t())); }, "parameter_list_t");
    }

    public static method_call(): Combi.Reuse {
        return re(() => {
            let exporting = seq(str("EXPORTING"), this.parameter_list_s());
            let importing = seq(str("IMPORTING"), this.parameter_list_t());
            let changing = seq(str("CHANGING"), this.parameter_list_t());
            let receiving = seq(str("RECEIVING"), this.parameter_t());
            let exceptions = seq(str("EXCEPTIONS"), this.parameter_list_t());   // todo
            let long = seq(opt(exporting),
                           opt(importing),
                           opt(changing),
                           opt(receiving),
                           opt(exceptions));

            return seq(this.field(), str("("), alt(reg(/.*/), long), str(")")); },
                  "method_call");
    }

    public static source(): Combi.Reuse {
        return re(() => {
            let single = alt(this.field(), this.method_call(), this.field_symbol_offset());
            let after = star(seq(this.arrow_or_dash(), this.field()));
            return alt(this.constant(), seq(single, after)); },
                  "source");
    }

    public static boolean(): Combi.Reuse {
// todo
        return re(() => { return star(reg(/.*/)); }, "boolean");
    }

    public static field(): Combi.Reuse {
        return re(() => { return seq(reg(/^\w+$/), star(seq(reg(/^-$/), reg(/^\w+$/)))); }, "field");
    }

    public static constant(): Combi.Reuse {
        return re(() => {
            let stri = reg(/('.*')|(`.*`)/);
            return alt(this.field(), stri, this.integer()); },
                  "constant");
    }
}