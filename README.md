[![](https://vsmarketplacebadge.apphb.com/version-short/srmeyers.git-prefix.svg)](https://marketplace.visualstudio.com/items?itemName=srmeyers.git-prefix)


# Git Prefix

## New in 1.2.0
Use a function return expression in the replacment string for more complex cases.

## Features
Button to run `Git Prefix Commit Message` command:

![Use button](images/git-prefix-button.gif)

Insert a value from the current branch name into the Source Control Git Message box.


![Demo Git Prefix](images/demo.gif)


## Usage

- Open the Command Palette `Ctrl+Shift+P` (`Cmd+Shift+P` on macOS)
- Type `Git Prefix Commit Message` and hit `return`
- The matching branch pattern is prefixed in the Git Message box

## Extension Settings

This extension contributes the following settings using JavaScript regular expression syntax:

* `gitPrefix.pattern`: Regular expression pattern to match in the branch name. Default matches
entire branch name.
  > Tip: Match a ticket in a branch created by Jira using a pattern such as: `.*(TEST-\d+).*`


* `gitPrefix.isSuffix`: Suffix expression instead of prefixing it.  Default is `false`.
* `gitPrefix.patternIgnoreCase`: Ignore case in pattern.  Default is `false`.
* `gitPrefix.replacementIsFunction`: If true, the replacement string is a function return expression where parameters (p1, p2, p3, etc.) correspond to the matching patterns $1, $2, $3, etc.. Default is false.
  > Example : p1 + (p3 ? \`(${p2}): ${p4.replace(/-/g, ' ')}\` : p2.replace(/-/g, ' '))
* `gitPrefix.replacement`: Regular expression replacement string to place into commit message. Default is `"[$1] "`.


**Happy Committing!**
