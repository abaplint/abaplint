import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {IRegistry} from "../_iregistry";
import {StructureType, TableAccessType, TableType} from "../abap/types/basic";
import {StatementNode} from "../abap/nodes";
import {ABAPFile} from "../abap/abap_file";
import {ISpaghettiScope} from "../abap/5_syntax/_spaghetti_scope";
import {Table} from "../objects";


export class SelectAddOrderByConf extends BasicRuleConfig {
  public skipForAllEntries: boolean = false;
}

export class SelectAddOrderBy implements IRule {
  private reg: IRegistry;
  private conf = new SelectAddOrderByConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "select_add_order_by",
      title: "SELECT add ORDER BY",
      shortDescription: `SELECTs add ORDER BY clause`,
      extendedInformation: `
This will make sure that the SELECT statement returns results in the same sequence on different databases

add ORDER BY PRIMARY KEY if in doubt

If the target is a sorted/hashed table, no issue is reported

With FOR ALL ENTRIES only ORDER BY PRIMARY KEY is allowed, and only when the field list holds the primary key,
so the issue is reported only where ORDER BY PRIMARY KEY can be added, https://github.com/abaplint/abaplint/issues/3131`,
      tags: [RuleTag.SingleFile],
      badExample: `SELECT * FROM db INTO TABLE @DATA(tab).`,
      goodExample: `SELECT * FROM db INTO TABLE @DATA(tab) ORDER BY PRIMARY KEY.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: SelectAddOrderByConf): void {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    const issues: Issue[] = [];
    if (!(obj instanceof ABAPObject) || obj.getType() === "INTF") {
      return [];
    }

    const spaghetti = new SyntaxLogic(this.reg, obj).run().spaghetti;

    for (const file of obj.getABAPFiles()) {
      const stru = file.getStructure();
      if (stru === undefined) {
        return issues;
      }

      const selects = stru.findAllStatements(Statements.Select);
      selects.push(...stru.findAllStatements(Statements.SelectLoop));
      for (const s of selects) {
        const concat = s.concatTokens().toUpperCase();
        if (concat.startsWith("SELECT SINGLE ")) {
          continue;
        } else if (this.getConfig()?.skipForAllEntries === true && concat.includes(" FOR ALL ENTRIES ")) {
          continue;
        }

        // skip COUNT(*)
        const list = s.findAllExpressions(Expressions.SQLField);
        if (list.length === 1 && list[0].getFirstChild()?.get() instanceof Expressions.SQLAggregation) {
          continue;
        } else if (s.findFirstExpression(Expressions.SQLOrderBy)) {
          continue;
        }

        if (this.isTargetSortedOrHashed(s, spaghetti, file)) {
          continue;
        } else if (s.findFirstExpression(Expressions.SQLJoin) && s.findFirstExpression(Expressions.SQLForAllEntries)) {
// see https://github.com/abaplint/abaplint/issues/2957
          continue;
        }

        if (s.findFirstExpression(Expressions.SQLForAllEntries)) {
          // only ORDER BY PRIMARY KEY is allowed, see https://github.com/abaplint/abaplint/issues/3131
          if (this.primaryKeyAllowed(s) === false) {
            continue;
          }
          issues.push(Issue.atStatement(file, s, "Add ORDER BY PRIMARY KEY", this.getMetadata().key, this.conf.severity));
          continue;
        }

        issues.push(Issue.atStatement(file, s, "Add ORDER BY", this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  /** FOR ALL ENTRIES: ORDER BY PRIMARY KEY needs the primary key in the field list, the client field excepted */
  private primaryKeyAllowed(s: StatementNode): boolean {
    const fieldList = s.findFirstExpression(Expressions.SQLFieldList);
    if (fieldList === undefined) {
      return false;
    }
    const list = fieldList.concatTokens().replace(/\s+/g, "");
    if (list === "*" || /^\w+~\*$/.test(list)) {
      return true;
    }

    const sources = s.findFirstExpression(Expressions.SQLFrom)?.findAllExpressions(Expressions.SQLFromSource) || [];
    const tableName = sources.length === 1 ? sources[0].findDirectExpression(Expressions.DatabaseTable)?.concatTokens() : undefined;
    const table = tableName ? this.reg.getObject("TABL", tableName.toUpperCase()) : undefined;
    if (!(table instanceof Table)) {
      // unknown table or a dynamic one, ORDER BY PRIMARY KEY might not be possible
      return false;
    }

    const selected = new Set<string>();
    for (const f of fieldList.findAllExpressions(Expressions.SQLField)) {
      let code = f.concatTokens().toUpperCase();
      const as = f.findDirectExpression(Expressions.SQLAsName)?.concatTokens();
      if (as) {
        code = code.replace(" AS " + as.toUpperCase(), "");
      }
      selected.add(code.includes("~") ? code.substring(code.indexOf("~") + 1) : code);
    }

    const ddic = table.getFields() || [];
    const isClient = (name: string) => {
      const field = ddic.find(d => d.FIELDNAME.toUpperCase() === name.toUpperCase());
      return field?.DATATYPE === "CLNT" || field?.ROLLNAME?.toUpperCase() === "MANDT"
        || ["MANDT", "CLIENT"].includes(name.toUpperCase());
    };
    const keys = table.listKeys(this.reg);
    if (keys.length === 0) {
      return false;
    }
    return keys.every((k, index) => (index === 0 && isClient(k)) || selected.has(k.toUpperCase()));
  }

  private isTargetSortedOrHashed(s: StatementNode, spaghetti: ISpaghettiScope, file: ABAPFile): boolean {
    const target = s.findFirstExpression(Expressions.SQLIntoTable)?.findFirstExpression(Expressions.Target);
    if (target) {
      const start = target.getFirstToken().getStart();
      const scope = spaghetti.lookupPosition(start, file.getFilename());
      let type = scope?.findWriteReference(start)?.getType();

      const children = target.getChildren();
      if (type instanceof StructureType && children.length >= 3 && children[1].concatTokens() === "-") {
        const found = type.getComponentByName(children[2].concatTokens());
        if (found === undefined) {
          return false;
        }
        type = found;
      }

      if (type instanceof TableType
          && (type?.getAccessType() === TableAccessType.sorted
          || type?.getAccessType() === TableAccessType.hashed)) {
        return true;
      }
    }
    return false;
  }

}