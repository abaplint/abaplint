import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata} from "./_irule";
import {ABAPFile, ABAPObject, Comment, Expressions, IObject, IRegistry, ISpaghettiScope, Position, Statements, SyntaxLogic} from "..";
import {Table} from "../objects";

export class SelectSingleFullKeyConf extends BasicRuleConfig {
  public allowPseudo = true;
}

export class SelectSingleFullKey implements IRule {
  private reg: IRegistry;
  private conf = new SelectSingleFullKeyConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "select_single_full_key",
      title: "Detect SELECT SINGLE which are possibily not unique",
      shortDescription: `Detect SELECT SINGLE which are possibily not unique`,
      extendedInformation: `Table definitions must be known, ie. inside the errorNamespace

If the statement contains a JOIN it is not checked`,
      pseudoComment: "EC CI_NOORDER",
      tags: [],
    };
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public getConfig() {
    if (this.conf === undefined) {
      this.conf = {
        allowPseudo: true,
      };
    }
    if (this.conf.allowPseudo === undefined) {
      this.conf.allowPseudo = true;
    }
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
        } else if (s.findFirstExpression(Expressions.SQLJoin)) {
          continue;
        } else if (s.findTokenSequencePosition("SELECT", "SINGLE") === undefined) {
          continue;
        }
        const databaseTable = s.findFirstExpression(Expressions.DatabaseTable);
        if (databaseTable === undefined) {
          continue;
        }
        const next = statements[i + 1];
        if (next?.get() instanceof Comment
            && next.concatTokens().includes(this.getMetadata().pseudoComment + "")) {
          if (this.getConfig().allowPseudo !== true) {
            issues.push(Issue.atStatement(file, s, "Pseudo comment not allowed", this.getMetadata().key, this.getConfig().severity));
          }
          continue;
        }

        const tabl = this.findReference(databaseTable.getFirstToken().getStart(), syntax.spaghetti, file);
        const table = this.reg.getObject("TABL", tabl) as Table | undefined;
        if (table === undefined) {
          continue;
        }
        const keys = table.listKeys(this.reg);

        const cond = s.findFirstExpression(Expressions.SQLCond);
        const set = new Set<string>();
        for (const key of keys) {
          if (key === "MANDT") {
            // todo, it should check for the correct type instead
            continue;
          }
          set.add(key);
        }

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
