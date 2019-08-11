import {Registry} from "../../registry";
import {FamixRepository} from "./famix_repository";
import {ModelABAPFile} from "./model_abapfile";
import {ClassAttributes} from "../../abap/types";
import * as Structures from "../../abap/structures/";
import * as Expressions from "../../abap/expressions/";
import {ModelClass} from "./model_class";
import {ModelMethods} from "./model_methods";

export class Moose {
  private reg: Registry;
  private readonly repo: FamixRepository;

  public constructor(reg: Registry) {
    this.reg = reg;
    this.repo = new FamixRepository();
  }

  private analyseClassAndMethodDefinition() {
    for (const file of this.reg.getABAPFiles()) {
      const modelFile = new ModelABAPFile(file);

      for (const classDef of file.getClassDefinitions()) {

        const modelClass = new ModelClass(this.repo, modelFile, classDef);
        const modelMethods = new ModelMethods(this.repo, modelFile, modelClass);


        modelMethods.toString();

        const callAttrs: ClassAttributes | undefined = classDef.getAttributes();
        if (callAttrs !== undefined) {
          for (const attr of callAttrs.getInstance()) {
            console.log(attr.getName());
            console.log(attr.getScope());
          }
        }
      }

      const structure = file.getStructure();
      if (structure) {
        for (const method of structure.findAllStructures(Structures.Method)) {
          for (const mcc of method.findAllExpressions(Expressions.MethodCallChain)) {
            console.log(mcc.countTokens());
          }

        }
      }


    }
  }

  public getMSE(): string {


    this.analyseClassAndMethodDefinition();


    return this.repo.getMSE();
  }

}