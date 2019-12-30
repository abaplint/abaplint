import {TypedIdentifier} from "../types/_typed_identifier";
import {StatementNode, ExpressionNode} from "../nodes";
import * as Statements from "../statements";
import * as Expressions from "../expressions";
import * as Types from "../types/basic/";
import {CurrentScope} from "./_current_scope";
import {AbstractType} from "../types/basic/_abstract_type";
import {TypedConstantIdentifier} from "../types/_typed_constant_identifier";
import {Chaining} from "./chaining";

export class BasicTypes {
  private readonly filename: string;
  private readonly scope: CurrentScope;

  public constructor(filename: string, scope: CurrentScope) {
    this.filename = filename;
    this.scope = scope;
  }

  public resolveTypeName(stat: StatementNode | ExpressionNode, expr: ExpressionNode | undefined): AbstractType | undefined {
// todo, move this to the expresssion, and perhaps rename/add another expression for types
    if (expr === undefined) {
      return undefined;
    }

    const chainText = expr.concatTokens().toUpperCase();
    if (chainText === "STRING") {
      return new Types.StringType();
    } else if (chainText === "XSTRING") {
      return new Types.XStringType();
    } else if (chainText === "D") {
      return new Types.DateType();
    } else if (chainText === "T") {
      return new Types.TimeType();
    } else if (chainText === "I") {
      return new Types.IntegerType();
    } else if (chainText === "F") {
      return new Types.FloatType();
    } else if (chainText === "C") {
      const len = this.findLength(stat);
      if (len) {
        return new Types.CharacterType(len);
      } else {
        return new Types.UnknownType("C, unable to parse length");
      }
    } else if (chainText === "X") {
      const len = this.findLength(stat);
      if (len) {
        return new Types.HexType(len);
      } else {
        return new Types.UnknownType("X, unable to parse length");
      }
    } else if (chainText === "N") {
      const len = this.findLength(stat);
      if (len) {
        return new Types.NumericType(len);
      } else {
        return new Types.UnknownType("N, unable to parse length");
      }
    }

    // todo, this only handles simple names
    const typ = this.scope.findType(chainText);
    if (typ) {
      return typ.getType();
    }

    const ddic = this.scope.getDDIC().lookup(chainText);
    if (ddic) {
      return ddic;
    }

    return undefined;
  }

  public simpleType(node: StatementNode): TypedIdentifier | undefined {
    const nameExpr = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (nameExpr === undefined) {
      return undefined;
    }
    const name = nameExpr.getFirstToken();
    const typename = node.findFirstExpression(Expressions.TypeName);

    const type = node.findFirstExpression(Expressions.Type);
    const text = type ? type.concatTokens().toUpperCase() : "TYPE";

    let found: AbstractType | undefined = undefined;
    if (text.startsWith("LIKE LINE OF")) {
      return undefined;
    } else if (text.startsWith("LIKE REF TO")) {
      return undefined;
    } else if (text.startsWith("LIKE")) {
      return undefined;
    } else if (text.startsWith("TYPE LINE OF")) {
      return undefined;
    } else if (text.startsWith("TYPE REF TO")) {
      found = this.resolveTypeRef(typename);
    } else if (text.startsWith("TYPE")) {
      found = this.resolveTypeName(node, typename);
      if (found === undefined && typename === undefined) {
        found = new Types.CharacterType(1);
      }
    }

    if (found) {
      if (node.get() instanceof Statements.Constant) { // todo, move this to Statements.Constant
        const val = this.findValue(node, name.getStr());
        if (val !== undefined) {
          return new TypedConstantIdentifier(name, this.filename, found, val);
        } else {
          return new TypedConstantIdentifier(name, this.filename, new Types.UnknownType("todo"), "unknown");
        }
      } else {
        return new TypedIdentifier(name, this.filename, found);
      }
    }

    return undefined;
  }

  private resolveTypeRef(chain: ExpressionNode | undefined): AbstractType | undefined {
    if (chain === undefined) {
      return undefined;
    }

    const name = chain.getFirstToken().getStr();

    const found = this.scope.findObjectReference(name);
    if (found) {
      return new Types.ObjectReferenceType(name);
    }

    return undefined;
  }

/////////////////////

  private findValue(node: StatementNode, name: string): string | undefined {
    const val = node.findFirstExpression(Expressions.Value);
    if (val === undefined) {
      throw new Error("set VALUE, " + name);
    }

    if (val.concatTokens().toUpperCase() === "VALUE IS INITIAL") {
      return "";
    }

    const constant = val.findFirstExpression(Expressions.Constant);
    if (constant) {
      return constant.concatTokens();
    }

    const chain = val.findFirstExpression(Expressions.SimpleFieldChain);
    if (chain) {
      return new Chaining(this.scope).resolveConstantValue(chain);
    }

    throw new Error("findValue, unexpected, " + name);
  }

  private findLength(node: StatementNode | ExpressionNode): number | undefined {
    const val = node.findFirstExpression(Expressions.Length);
    const flen = node.findFirstExpression(Expressions.ConstantFieldLength);

    if (val && flen) {
      throw new Error("Only specify length once");
    }

    if (flen) {
      const cintExpr = flen.findFirstExpression(Expressions.Integer);
      if (cintExpr) {
        return this.parseInt(cintExpr.concatTokens());
      }

      const cchain = flen.findFirstExpression(Expressions.SimpleFieldChain);
      if (cchain) {
        return this.parseInt(new Chaining(this.scope).resolveConstantValue(cchain));
      }
    }

    if (val === undefined) {
      return 1;
    }

    const intExpr = val.findFirstExpression(Expressions.Integer);
    if (intExpr) {
      return this.parseInt(intExpr.concatTokens());
    }

    const strExpr = val.findFirstExpression(Expressions.ConstantString);
    if (strExpr) {
      return this.parseInt(strExpr.concatTokens());
    }

    const chain = val.findFirstExpression(Expressions.SimpleFieldChain);
    if (chain) {
      return this.parseInt(new Chaining(this.scope).resolveConstantValue(chain));
    }

    throw new Error("Unexpected, findLength");
  }

  private parseInt(text: string | undefined): number | undefined {
    if (text === undefined) {
      return undefined;
    }

    if (text.startsWith("'")) {
      text = text.split("'")[1];
    } else if (text.startsWith("`")) {
      text = text.split("`")[1];
    }

    return parseInt(text, 10);
  }

}