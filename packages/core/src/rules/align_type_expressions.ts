import {ABAPFile} from "../abap/abap_file";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Class} from "../objects";
import {DDIC} from "../ddic";
import {IObject} from "../objects/_iobject";
import {IRuleMetadata, RuleTag} from "./_irule";
import {Issue} from "../issue";
import {Position} from "../position";
import {StructureNode} from "../abap/nodes";
import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {EditHelper, IEdit} from "../edit_helper";

type fields = {nameEnd: Position, after: Position}[];

export class AlignTypeExpressionsConf extends BasicRuleConfig {
  /** Ignore global exception classes */
  public ignoreExceptions: boolean = true;
}

export class AlignTypeExpressions extends ABAPRule {
  private conf = new AlignTypeExpressionsConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "align_type_expressions",
      title: "Align TYPE expressions",
      shortDescription: `Align TYPE expressions in statements`,
      extendedInformation: `
Currently works for METHODS + BEGIN OF

If BEGIN OF has an INCLUDE TYPE its ignored

Also note that clean ABAP does not recommend aligning TYPE clauses:
https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#dont-align-type-clauses`,
      tags: [RuleTag.SingleFile, RuleTag.Whitespace, RuleTag.Quickfix],
      badExample: `
TYPES: BEGIN OF foo,
         bar TYPE i,
         foobar TYPE i,
       END OF foo.

INTERFACE lif.
  METHODS bar
    IMPORTING
      foo TYPE i
      foobar TYPE i.
ENDINTERFACE.`,
      goodExample: `
TYPES: BEGIN OF foo,
         bar    TYPE i,
         foobar TYPE i,
       END OF foo.

INTERFACE lif.
  METHODS bar
    IMPORTING
      foo    TYPE i
      foobar TYPE i.
ENDINTERFACE.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AlignTypeExpressionsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: IObject) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return issues; // parser error
    }

    const ddic = new DDIC(this.reg);

    if (obj instanceof Class) {
      const definition = obj.getClassDefinition();
      if (definition === undefined) {
        return [];
      } else if (this.conf.ignoreExceptions && ddic.isException(definition, obj)) {
        return [];
      }
    }

    issues.push(...this.checkTypes(stru, file));
    issues.push(...this.checkMethods(stru, file));

    return issues;
  }

  private check(fields: fields, column: number, file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    const rows = new Set<number>();
    for (const f of fields) {
      const row = f.after.getRow();
      if (rows.has(row)) {
        return [];
      }
      rows.add(row);
    }

    for (const f of fields) {
      if (f.after.getCol() === column) {
        continue;
      }

      let fix: IEdit | undefined = undefined;
      if (f.after.getCol() < column) {
        fix = EditHelper.insertAt(file, f.after, " ".repeat(column - f.after.getCol()));
      } else {
        fix = EditHelper.deleteRange(file, new Position(f.after.getRow(), column), f.after);
      }

      const message = `Align TYPE expressions to column ${column}`;
      const issue = Issue.atPosition(file, f.after, message, this.getMetadata().key, this.conf.severity, fix);
      issues.push(issue);
    }

    return issues;
  }

  private checkMethods(stru: StructureNode, file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    const methods = stru.findAllStatements(Statements.MethodDef);
    for (const m of methods) {
      const fields: fields = [];
      const params = m.findAllExpressions(Expressions.MethodParam);
      let column = 0;
      for (const p of params) {
        const children = p.getChildren();
        const name = children[children.length - 2];
        fields.push({
          nameEnd: name.getLastToken().getEnd(),
          after: p.findFirstExpression(Expressions.TypeParam)!.getFirstToken().getStart()});
        column = Math.max(column, name.getFirstToken().getEnd().getCol() + 1);
      }

      const ret = m.findFirstExpression(Expressions.MethodDefReturning);
      if (ret) {
        const children = ret.getChildren();
        const name = children[children.length - 2];
        fields.push({
          nameEnd: name.getLastToken().getEnd(),
          after: ret.findFirstExpression(Expressions.TypeParam)!.getFirstToken().getStart()});
        column = Math.max(column, name.getLastToken().getEnd().getCol() + 1);
      }

      issues.push(...this.check(fields, column, file));
    }

    return issues;
  }

  private checkTypes(stru: StructureNode, file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    const types = stru.findAllStructuresRecursive(Structures.Types);
    for (const t of types) {
      if (t.findDirectStatement(Statements.IncludeType)) {
        continue;
      }

      const fields: fields = [];
      let column = 0;
      const st = t.findDirectStatements(Statements.Type);
      for (const s of st) {
        const name = s.getChildren()[1];
        fields.push({
          nameEnd: name.getLastToken().getEnd(),
          after: s.getChildren()[2].getFirstToken().getStart()});
        column = Math.max(column, name.getFirstToken().getEnd().getCol() + 1);
      }

      issues.push(...this.check(fields, column, file));
    }

    return issues;
  }

}
