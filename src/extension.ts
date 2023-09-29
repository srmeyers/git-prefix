import * as vscode from 'vscode'
import { GitExtension, Repository } from './api/git'

export function activate (context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('gitPrefix.setMessage', async (uri?) => {
    const git = getGitExtension()

    if (!git) {
      vscode.window.showErrorMessage('Unable to load Git Extension')
      return
    }

    vscode.commands.executeCommand('workbench.view.scm')

    if (uri) {
      const selectedRepository = git.repositories.find(repository => {
        return repository.rootUri.path === uri.rootUri.path
      })

      if (selectedRepository) {
        await prefixCommit(selectedRepository)
      }
    } else {
      for (const repo of git.repositories) {
        await prefixCommit(repo)
      }
    }
  })

  context.subscriptions.push(disposable)
}

async function prefixCommit (repository: Repository) {
  const { isSuffix, replacement = '[$1] ', pattern = '(.*)', patternIgnoreCase, replacementIsFunction } = vscode.workspace.getConfiguration('gitPrefix')
  const branchRegEx = patternIgnoreCase ? new RegExp(pattern, 'i') : new RegExp(pattern)
  const branchName = (repository.state.HEAD && repository.state.HEAD.name) || ''

  if (branchRegEx.test(branchName)) {
    let ticket
    if (replacementIsFunction) {
      ticket = branchName.replace(
        branchRegEx,
        (_substring: string, ...args: any[]) =>
          // eslint-disable-next-line no-new-func
          Function(
            ...(Array(args.length).fill(1).map((x, y) => `p${x + y}`)), // Build args 'p1', 'p2', 'p3'....
            `return ${replacement}`
          )(...args)
      )
    } else {
      ticket = branchName.replace(branchRegEx, replacement)
    }
    const curMessage = repository.inputBox.value.replace(new RegExp(ticket, 'g'), '')
    repository.inputBox.value = isSuffix ? `${curMessage}${ticket}` : `${ticket}${curMessage}`
    vscode.commands.executeCommand("list.focusFirst")
    vscode.commands.executeCommand("list.select")
  } else {
    const message = `Pattern ${pattern} not found in branch ${branchName}`
    const editPattern = 'Edit Pattern'
    const result = await vscode.window.showErrorMessage(message, { modal: false }, editPattern)
    if (result === editPattern) {
      vscode.commands.executeCommand('workbench.action.openSettings')
      vscode.commands.executeCommand('settings.action.clearSearchResults')
    }
  }
}

function getGitExtension () {
  const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git')
  const gitExtension = vscodeGit && vscodeGit.exports
  return gitExtension && gitExtension.getAPI(1)
}

export function deactivate () { 
  // called when extension is deactivated
}
