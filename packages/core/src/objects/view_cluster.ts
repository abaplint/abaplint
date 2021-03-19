import {AbstractObject} from "./_abstract_object";

export class ViewCluster extends AbstractObject {

  public getType(): string {
    return "VCLS";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
