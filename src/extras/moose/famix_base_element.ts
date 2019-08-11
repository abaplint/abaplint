import {FamixMseExporter} from "./famix_mse_exporter";
import {FamixRepository} from "./famix_repository";

export abstract class FamixBaseElement {

  private _id: number;

  constructor(repo: FamixRepository) {
    repo.addElement(this);
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  public abstract getMSE(): string;

  // @ts-ignore
  // tslint:disable-next-line:no-empty
  public addPropertiesToExporter(exporter: FamixMseExporter): void {
  }

}
