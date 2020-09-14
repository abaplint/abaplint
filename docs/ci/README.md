# Using abaplint in Continuous Integration

There are several ways to enable automated linting of your code in popular cloud git repositories. This will allow auto-linting of commits to master branch and auto checks for upcoming pull requests from colleagues or contributors.

## GitHub App
One click install, [GitHub App](https://github.com/apps/abaplint)

Gives annotations and suggested changes.

## Github Actions
Add [abaplint-action](https://github.com/marketplace/actions/abaplint-action) to the action, this will give annotated errors in the actions log.

Does not give annotations for pull requests via forks.

## Github Actions, raw setup
Raw setup, example workflow can be seen in [github-actions-workflow.yml](github-actions-workflow.yml). See working repo example at [abaplinted_sample gitHUB](https://github.com/sbcgua/abaplinted_sample)

## Gitlab Pipelines
example can be found in [examples/.gitlab-ci.yml](examples/.gitlab-ci.yml). Working repo for this configuration can be found at [abaplinted_sample gitLAB](https://gitlab.com/atsybulsky/abaplinted_sample)
or [sbu-absw/abaplint-example](https://gitlab.com/sbu-absw/abaplint-example)

## Travis CI
example configuration is in [examples/.travis.yml](examples/.travis.yml). Repository example is at [abaplinted_sample gitHUB](https://github.com/sbcgua/abaplinted_sample) (also check pull requests)

[Blog Post](https://blogs.sap.com/2018/12/25/automatic-checking-of-your-abap-code-in-githubgitlab-with-ci-and-abaplint/)

## Bitbucket Pipelines
[Example](https://bitbucket.org/larshp/abaplint_pipeline)

## Azure Pipelines
[Example](https://github.com/abaplint/azure-devops-example)
