import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import * as Structures from "../abap/3_structures/structures";
import {IRuleMetadata, RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";
import {StatementNode, StructureNode} from "../abap/nodes";
import {IRegistry} from "../_iregistry";
import {Class} from "../objects";
import {DDIC} from "../ddic";

export class UncaughtExceptionConf extends BasicRuleConfig {
}

export class UncaughtException extends ABAPRule {

  private conf = new UncaughtExceptionConf();

  private readonly globalExceptions: {name: string, super: string | undefined}[] = [];
  private issues: Issue[] = [];
  private sinked: string[] | undefined;

  public getMetadata(): IRuleMetadata {
    return {
      key: "uncaught_exception",
      title: "Uncaught Exception",
      shortDescription: `Uncaught Exception`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    super.initialize(reg);
    this.findGlobalExceptions();
    return this;
  }

  public setConfig(conf: UncaughtExceptionConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    this.issues = [];
    this.sinked = undefined;
    for (const c of stru.getChildren()) {
      this.traverse(c, file);
    }

    return this.issues;
  }

  private traverse(n: StructureNode | StatementNode, file: ABAPFile) {
    if (n.get() instanceof Structures.ClassDefinition
        || n.get() instanceof Structures.Interface) {
      return; // to optimize performance
    } else if (n.get() instanceof Structures.Try) {
//      console.dir("todo, try structure");

    } else if (n instanceof StatementNode && n.get() instanceof Statements.Method) {
//      console.dir("todo, method structure");
    } else if (n instanceof StatementNode && n.get() instanceof Statements.EndMethod) {
      this.sinked = undefined; // back to top level

    } else if (n instanceof StatementNode && n.get() instanceof Statements.Form) {
      this.sinked = [];
      const raising = n.findDirectExpression(Expressions.FormRaising);
      for (const c of raising?.findAllExpressions(Expressions.ClassName) || []) {
        this.sinked.push(c.concatTokens().toUpperCase());
      }
    } else if (n instanceof StatementNode && n.get() instanceof Statements.EndForm) {
      this.sinked = undefined; // back to top level

    } else if (n instanceof StatementNode && n.get() instanceof Statements.Raise) {
      let name: string | undefined = undefined;

      const concat = n.concatTokens().toUpperCase();
      if (concat.startsWith("RAISE EXCEPTION TYPE ")) {
        name = n.findFirstExpression(Expressions.ClassName)?.getFirstToken().getStr().toUpperCase();
      }

      if (this.isSinked(name) === false) {
        const issue = Issue.atStatement(file, n, "Uncaught exception", this.getMetadata().key, );
        this.issues.push(issue);
      }
    } else if (n instanceof StatementNode && n.get() instanceof Statements.Perform) {
      // todo, PERFORM
    } else if (n instanceof StatementNode) {
      // todo, search for method call references
    }

    if (n instanceof StructureNode) {
      for (const c of n.getChildren()) {
        this.traverse(c, file);
      }
    }

  }

  private isSinked(name: string | undefined): boolean {
    if (this.sinked === undefined || name === undefined) {
      return true;
    }

    // todo, check hierarchy, both this.globalExceptions and local classes
    return this.sinked.some(a => a === name);
  }

  private findGlobalExceptions() {
    const ddic = new DDIC(this.reg);
    for (const o of this.reg.getObjects()) {
      if (!(o instanceof Class)) {
        continue;
      }
      const def = o.getMainABAPFile()?.getInfo().getClassDefinitionByName(o.getName());
      if (def === undefined || ddic.isException(def, o) === false) {
        continue;
      }

      this.globalExceptions.push({name: o.getName(), super: def.superClassName});
    }

  }

}