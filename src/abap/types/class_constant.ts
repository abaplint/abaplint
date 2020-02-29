import {Visibility} from "./visibility";
import {TypedIdentifier} from "./_typed_identifier";

export class ClassConstant extends TypedIdentifier {
  private readonly visibility: Visibility;

  public constructor(id: TypedIdentifier, visibility: Visibility) {
    super(id.getToken(), id.getFilename(), id.getType());
    this.visibility = visibility;
  }

  public getVisibility() {
    return this.visibility;
  }
}