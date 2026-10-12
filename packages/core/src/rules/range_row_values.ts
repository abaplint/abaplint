import * as Expressions from "../abap/2_statements/expressions";
import {ABAPFile} from "../abap/abap_file";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ExpressionNode} from "../abap/nodes";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {StructureType, TableType} from "../abap/types/basic";
import {Issue} from "../issue";
import {ABAPObject} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";

const RANGE_COMPONENTS = ["SIGN", "OPTION", "LOW", "HIGH"];
const SIGNS = ["I", "E"];
const OPTIONS = ["EQ", "NE", "BT", "NB", "CP", "NP", "GT", "GE", "LT", "LE"];

export class RangeRowValuesConf extends BasicRuleConfig {
}

export class RangeRowValues implements IRule {
  private reg: IRegistry;
  private conf = new RangeRowValuesConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "range_row_values",
      title: "Range row values",
      shortDescription: `Checks the SIGN and OPTION of range rows built with VALUE`,
      extendedInformation: `A row of a range table, ie. a structure with exactly the components SIGN, OPTION, LOW and HIGH,
is a selection structure to the syntax check. For a VALUE row of one, the system warns when SIGN or OPTION
is missing, and when a literal is not a permitted value: SIGN must be I or E, OPTION one of
EQ NE BT NB CP NP GT GE LT LE, in upper case.

Components given in the VALUE header count for the rows that follow, eg. VALUE #( sign = 'I' option = 'EQ' ( low = 1 ) ).
Only literals are checked, a value from a variable, constant or expression is not.`,
      tags: [RuleTag.Syntax],
      badExample: `TYPES ty_range TYPE RANGE OF string.
DATA(range) = VALUE ty_range( ( sign = 'I' option = 'eq' low = \`a\` )
                              ( sign = 'I' low = \`b\` ) ).`,
      goodExample: `TYPES ty_range TYPE RANGE OF string.
DATA(range) = VALUE ty_range( ( sign = 'I' option = 'EQ' low = \`a\` )
                              ( sign = 'I' option = 'EQ' low = \`b\` ) ).`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: RangeRowValuesConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return [];
    }

    const issues: Issue[] = [];
    for (const file of obj.getABAPFiles()) {
      for (const source of file.getStructure()?.findAllExpressionsRecursive(Expressions.Source) || []) {
        if (source.getFirstToken().getStr().toUpperCase() !== "VALUE") {
          continue;
        }
        const typeToken = source.findDirectExpression(Expressions.TypeNameOrInfer)?.getFirstToken();
        const body = source.findDirectExpression(Expressions.ValueBody);
        if (typeToken === undefined || body === undefined) {
          continue;
        }

        const scope = syntax.spaghetti.lookupPosition(typeToken.getStart(), file.getFilename());
        const resolved = scope?.getData().references.find(r =>
          r.referenceType === ReferenceType.InferredType
          && r.position.getStart().equals(typeToken.getStart()))?.resolved;
        if (!(resolved instanceof TypedIdentifier)) {
          continue;
        }
        const type = resolved.getType();

        if (type instanceof TableType && this.isRangeRow(type.getRowType())) {
          const header = new Map<string, ExpressionNode>();
          for (const child of body.getChildren()) {
            if (!(child instanceof ExpressionNode)) {
              continue;
            } else if (child.get() instanceof Expressions.FieldAssignment) {
              this.addAssignment(header, child);
            } else if (child.get() instanceof Expressions.ValueBodyLine) {
              const assignments = child.findDirectExpressions(Expressions.FieldAssignment);
              if (assignments.length === 0) {
                continue;
              }
              const row = new Map(header);
              for (const a of assignments) {
                this.addAssignment(row, a);
              }
              issues.push(...this.checkRow(file, child, row));
            }
          }
        } else if (this.isRangeRow(type) && body.findDirectExpression(Expressions.ValueBase) === undefined) {
          const assignments = body.findDirectExpressions(Expressions.FieldAssignment);
          if (assignments.length === 0) {
            continue;
          }
          const row = new Map<string, ExpressionNode>();
          for (const a of assignments) {
            this.addAssignment(row, a);
          }
          issues.push(...this.checkRow(file, body, row));
        }
      }
    }

    return issues;
  }

////////////////

  private isRangeRow(type: AbstractType): boolean {
    if (!(type instanceof StructureType)) {
      return false;
    }
    const names = type.getComponents().map(c => c.name.toUpperCase());
    return names.length === RANGE_COMPONENTS.length && RANGE_COMPONENTS.every(c => names.includes(c));
  }

  private addAssignment(row: Map<string, ExpressionNode>, assignment: ExpressionNode) {
    const name = assignment.findDirectExpression(Expressions.FieldSub)?.concatTokens().toUpperCase();
    const source = assignment.findDirectExpression(Expressions.Source);
    if (name && source) {
      row.set(name, source);
    }
  }

  private checkRow(file: ABAPFile, node: ExpressionNode, row: Map<string, ExpressionNode>): Issue[] {
    const issues: Issue[] = [];
    for (const [component, allowed] of [["SIGN", SIGNS], ["OPTION", OPTIONS]] as const) {
      const source = row.get(component);
      if (source === undefined) {
        const message = `Specification ${component} is missing in the range row`;
        issues.push(Issue.atToken(file, node.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
        continue;
      }
      const value = this.literal(source);
      if (value !== undefined && !(allowed as readonly string[]).includes(value)) {
        const message = `"${value}" is not a permitted value for ${component}, expected ${allowed.join(" ")}`;
        issues.push(Issue.atToken(file, source.getFirstToken(), message, this.getMetadata().key, this.conf.severity));
      }
    }
    return issues;
  }

  /** The content of a character literal, undefined for anything else */
  private literal(source: ExpressionNode): string | undefined {
    if (source.getChildren().length !== 1) {
      return undefined;
    }
    const str = source.findDirectExpression(Expressions.Constant)
      ?.findDirectExpression(Expressions.ConstantString)?.getFirstToken().getStr();
    if (str === undefined) {
      return undefined;
    }
    const quote = str.charAt(0);
    return str.slice(1, -1).split(quote + quote).join(quote);
  }

}
