import { Statement } from "./statement";
import { Token } from "../tokens/";
import Registry from "../registry";

export class Define extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^DEFINE /.test(str)) {
            Registry.add_macro(tokens[1].get_str());
            return new Define(tokens);
        }
        return undefined;
    }

}