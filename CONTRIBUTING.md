# Contributions

🎉 Thanks for considering contributing to this project! 🎉

These guidelines will help you send a pull request.

Please note that this project is not intended to be used outside my own projects so new features are unlikely to be
accepted.

If you're submitting an issue instead, please skip this document.

If your pull request is related to a typo or the documentation being unclear, please click on the relevant page's `Edit`
button (pencil icon) and directly suggest a correction instead.

This project was made with ❤️. The simplest way to give back is by starring and sharing it online.

Everyone is welcome regardless of personal background. We enforce a [Code of conduct](CODE_OF_CONDUCT.md) in order to
promote a positive and inclusive environment.

# Development process

First fork and clone the repository. If you're not sure how to do this, please watch
[these videos](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

Run:

```bash
npm install
```

Make sure everything is correctly setup with:

```bash
npm test
```

After submitting the pull request, please make sure the Continuous Integration checks are passing.

### Creating a prerelease

1. Create a branch named `releases/<tag>/<version>` with the version you'd like to release.
2. Push the branch to the repo.

For example, a branch named `releases/rc/4.0.0` will create the version `v4.0.0-rc` and publish it under the `rc` tag.

## Releasing

Merge the release PR
