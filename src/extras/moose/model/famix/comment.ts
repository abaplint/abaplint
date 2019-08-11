// automatically generated code, please do not change

import {FamixMseExporter} from "../../famix_mse_exporter";
import {SourcedEntity} from "./../famix/sourced_entity";


export class Comment extends SourcedEntity {


  private commentContainer: SourcedEntity;

  // oneMany.Getter
  // @FameProperty(name = "container", opposite = "comments")
  public getContainer(): SourcedEntity {
    return this.commentContainer;
  }

  // oneMany.Setter
  public setContainer(newContainer: SourcedEntity) {
    this.commentContainer = newContainer;
    newContainer.getComments().add(this);
  }

  private commentContent: String;

  // @FameProperty(name = "content")
  public getContent(): String {
    return this.commentContent;
  }

  public setContent(commentContent: String) {
    this.commentContent = commentContent;
  }



  public getMSE(): string {
    const mse: FamixMseExporter = new FamixMseExporter("FAMIX.Comment", this);
    this.addPropertiesToExporter(mse);
    return mse.getMSE();
  }

  public addPropertiesToExporter(exporter: FamixMseExporter) {
    super.addPropertiesToExporter(exporter);
    exporter.addProperty("container", this.getContainer());
    exporter.addProperty("content", this.getContent());

  }

}

