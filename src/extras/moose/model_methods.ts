import {ModelABAPFile} from "./model_abapfile";
import {FamixRepository} from "./famix_repository";
import {MethodDefinition, MethodDefinitions, Scope} from "../../abap/types";
import {Method} from "./model/famix/Method";
import {ModelClass} from "./model_class";
import {Class} from "./model/famix/Class";

export class ModelMethods {
  private readonly methodeDefinitions: MethodDefinitions | undefined;

  public constructor(repo: FamixRepository, modelFile: ModelABAPFile, modelClass: ModelClass) {
    this.methodeDefinitions = modelClass.getClassDefinition().getMethodDefinitions();
    if (this.methodeDefinitions) {
      this.analyseMethodDefinition(repo, modelFile, modelClass.getFamixClass(), this.methodeDefinitions.getAll());
    }
  }

  private analyseMethodDefinition(repo: FamixRepository, modelFile: ModelABAPFile, famixClass: Class,
                                  methodeDefinitions: MethodDefinition[]) {
    for (const methodDef of methodeDefinitions) {
      const famixMethod = new Method(repo);
      famixMethod.setName(methodDef.getName());
      famixMethod.addModifiers(Scope[methodDef.getScope()].toLowerCase());
      famixMethod.setParentType(famixClass);

      // todo FileAnchor to implementation or definition?
      ModelABAPFile.createIndexedFileAnchor(repo, modelFile, famixMethod, methodDef.getStart(), methodDef.getEnd());
    }
  }

}