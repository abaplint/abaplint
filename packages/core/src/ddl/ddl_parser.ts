import {Comment} from "../abap/1_lexer/tokens";
import {Combi} from "../abap/2_statements/combi";
import {ExpressionNode} from "../abap/nodes";
import {IFile} from "../files/_ifile";
import {defaultRelease} from "../version";
import {CDSLexer} from "../cds/cds_lexer";
import * as Expressions from "./expressions";

export enum DDLKind {
  Structure = "structure",
  Table = "table",
  Aspect = "aspect",
  ExtendType = "extend-type",
}

export interface IDDLParserResultField {
  key: boolean,
  name: string,
  type: string,
  notNull: boolean,
}

export interface IDDLParserResult {
  name: string,
  kind: DDLKind,
  fields: IDDLParserResultField[];
}

export class DDLParser {
  public parse(file: IFile): IDDLParserResult | undefined {
    let tokens = CDSLexer.run(file);
    tokens = tokens.filter(t => !(t instanceof Comment));

    let res = Combi.run(new Expressions.DDLStructure(), tokens, defaultRelease);
    if (res === undefined) {
      res = Combi.run(new Expressions.DDLTable(), tokens, defaultRelease);
    }
    if (res === undefined) {
      res = Combi.run(new Expressions.DDLAspect(), tokens, defaultRelease);
    }
    if (res === undefined) {
      res = Combi.run(new Expressions.DDLExtendType(), tokens, defaultRelease);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      return undefined;
    }
    return this.parsedToResult(res[0]);
  }

  private parsedToResult(node: ExpressionNode): IDDLParserResult {
    const fields: IDDLParserResultField[] = [];
    for (const child of node.getChildren()) {
      if (!(child instanceof ExpressionNode)) { continue; }
      const expr = child.get();
      const isField = expr instanceof Expressions.DDLStructureField
        || expr instanceof Expressions.DDLTableField
        || expr instanceof Expressions.DDLInclude
        || expr instanceof Expressions.DDLNamedInclude;
      if (!isField) { continue; }

      const key = this.hasKey(child);
      const notNull = this.hasNotNull(child);
      if (expr instanceof Expressions.DDLInclude) {
        const target = this.compactTokens(child.findDirectExpression(Expressions.DDLName));
        fields.push({name: ".INCLUDE", type: target, key, notNull});
      } else if (expr instanceof Expressions.DDLNamedInclude) {
        const names = child.findDirectExpressions(Expressions.DDLName);
        const alias = this.compactTokens(names[0]);
        const target = this.compactTokens(names[1]);
        fields.push({name: alias, type: target, key, notNull});
      } else {
        const name = this.compactTokens(child.findDirectExpression(Expressions.DDLName));
        const type = this.compactTokens(child.findDirectExpression(Expressions.DDLType));
        fields.push({name, type, key, notNull});
      }
    }

    const result: IDDLParserResult = {
      name: this.compactTokens(node.findDirectExpression(Expressions.DDLName)),
      kind: this.kindOf(node),
      fields,
    };

    return result;
  }

  private compactTokens(node: ExpressionNode | undefined): string {
    if (node === undefined) {
      return "";
    }
    return node.concatTokens().replace(/\s+/g, "");
  }

  private hasKey(node: ExpressionNode): boolean {
    for (const c of node.getChildren()) {
      const expr = (c as any).get?.();
      const ctor = expr?.constructor?.name;
      if (ctor === "CDSAnnotation") { continue; }
      const tok = c.concatTokens().toUpperCase().trim();
      if (tok === "KEY") { return true; }
      if (tok !== "") { return false; }
    }
    return false;
  }

  private hasNotNull(node: ExpressionNode): boolean {
    const children = node.getChildren();
    for (let i = 0; i < children.length - 1; i++) {
      const a = (children[i] as any).concatTokens?.().toUpperCase().trim();
      const b = (children[i + 1] as any).concatTokens?.().toUpperCase().trim();
      if (a === "NOT" && b === "NULL") { return true; }
    }
    return false;
  }

  private kindOf(node: ExpressionNode): DDLKind {
    const expr = node.get();
    if (expr instanceof Expressions.DDLStructure) { return DDLKind.Structure; }
    if (expr instanceof Expressions.DDLAspect) { return DDLKind.Aspect; }
    if (expr instanceof Expressions.DDLExtendType) { return DDLKind.ExtendType; }
    return DDLKind.Table;
  }
}
