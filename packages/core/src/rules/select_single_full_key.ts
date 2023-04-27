import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile, ABAPObject, Comment, Expressions, IObject, IRegistry, ISpaghettiScope, Position, Statements, SyntaxLogic} from "..";
import {Table} from "../objects";

export class SelectSingleFullKeyConf extends BasicRuleConfig {
}

export class SelectSingleFullKey implements IRule {
  private reg: IRegistry;
  private conf = new SelectSingleFullKeyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "select_single_full_key",
      title: "Detect SELECT SINGLE which are possibily not unique",
      shortDescription: `Detect SELECT SINGLE which are possibily not unique`,
      extendedInformation: `Table definitions must be known, ie. inside the errorNamespace`,
      pseudoComment: "EC CI_NOORDER",
      tags: [RuleTag.Experimental],
    };
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: SelectSingleFullKeyConf) {
    this.conf = conf;
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
    const message = "SELECT SINGLE possibily not unique";

    for (const file of obj.getABAPFiles()) {
      const statements = file.getStatements();
      for (let i = 0; i < statements.length; i++) {
        const s = statements[i];
        if (!(s.get() instanceof Statements.Select)) {
          continue;
        } else if (s.findTokenSequencePosition("SELECT", "SINGLE") === undefined) {
          continue;
        }
        const databaseTable = s.findFirstExpression(Expressions.DatabaseTable);
        if (databaseTable === undefined) {
          continue;
        }
        const next = statements[i + 1];
        if (next?.get() instanceof Comment && next.concatTokens().includes(this.getMetadata().pseudoComment + "")) {
          continue;
        }

        const tabl = this.findReference(databaseTable.getFirstToken().getStart(), syntax.spaghetti, file);
        const keys = (this.reg.getObject("TABL", tabl) as Table).listKeys(this.reg);

        const cond = s.findFirstExpression(Expressions.SQLCond);
        const set = new Set<string>(keys);

        for (const compare of cond?.findAllExpressionsRecursive(Expressions.SQLCompare) || []) {
          if (compare.getChildren().length === 3) {
            const fname = compare.findDirectExpression(Expressions.SQLFieldName)?.concatTokens().toUpperCase();
            const operator = compare.findDirectExpression(Expressions.SQLCompareOperator)?.concatTokens().toUpperCase();
            if (fname && (operator === "=" || operator === "EQ")) {
              set.delete(fname);
            }
          }
        }

        if (set.size > 0) {
          issues.push(Issue.atStatement(file, s, message, this.getMetadata().key, this.getConfig().severity));
        }
      }
    }

    return issues;
  }

  private findReference(position: Position, spaghetti: ISpaghettiScope, file: ABAPFile) {
    const scope = spaghetti.lookupPosition(position, file.getFilename());
    return scope?.findTableReference(position);
  }

}
