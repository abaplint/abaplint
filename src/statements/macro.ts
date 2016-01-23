import { Statement } from "./statement";
import { Token } from "../tokens/";
import Registry from "../registry";

export class Macro extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = tokens[0].get_str();
        if (Registry.is_macro(str)) {
            return new Macro(tokens);
        }
        return undefined;
    }

}