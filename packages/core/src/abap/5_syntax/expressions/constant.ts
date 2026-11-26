import {ExpressionNode} from "../../nodes";
import {CharacterType, IntegerType, PackedType, StringType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Integer} from "../../2_statements/expressions";

export class Constant {
  public static runSyntax(node: ExpressionNode): AbstractType {
    // todo: ConcatenatedConstant is not used?
    const integer = node.findDirectExpression(Integer);
    if (integer) {
      return this.numberType(integer.concatTokens());
    }

    const first = node.getFirstToken().getStr();
    if (first.startsWith("'")) {
      let len = first.length - 2;
      if (len <= 0) {
        len = 1;
      }
      return new CharacterType(len, {derivedFromConstant: true});
    } else if (first.startsWith("`")) {
      return StringType.get({derivedFromConstant: true});
    } else {
      return StringType.get();
    }
  }

  // a number literal is of type i if its value is in the range of i, else of type p without decimals,
  // with length 8 for up to 15 digits and length 16 above, leading zeros not counted
  private static numberType(literal: string): AbstractType {
    const value = Number(literal.replace(/\s/g, ""));
    if (value >= -2147483648 && value <= 2147483647) {
      return IntegerType.get({derivedFromConstant: true});
    }
    const digits = literal.replace(/\D/g, "").replace(/^0+/, "");
    return new PackedType(digits.length <= 15 ? 8 : 16, 0, {derivedFromConstant: true});
  }
}