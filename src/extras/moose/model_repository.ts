import {ModelClass} from "./model_class";

export class ModelRepository {

  private classes: Set<ModelClass> = new Set<ModelClass>();
  private static repo: ModelRepository = new ModelRepository();

  public static getRepo(): ModelRepository {
    return this.repo;
  }

  public addModelClass(modelClass: ModelClass) {
    this.classes.add(modelClass);
  }

  public getModelClass(modelClassName: string): ModelClass | undefined {
    for (const c of this.classes) {
      if (c.getFamixClass().getName() === modelClassName.toLowerCase()) {
        return c;
      }
    }
    return undefined;
  }


}