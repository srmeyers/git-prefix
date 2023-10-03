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
  const { isSuffix, pattern = '(.*)', patternIgnoreCase } = vscode.workspace.getConfiguration('gitPrefix')

  const branchRegEx = new RegExp(pattern, patternIgnoreCase ? 'i' : '')
  const branchName = (repository.state.HEAD && repository.state.HEAD.name) || ''

  if (branchRegEx.test(branchName)) {
    const ticket = getTicket(repository, branchName, branchRegEx)
    const currentMessage = repository.inputBox.value.split(ticket).join('');

    repository.inputBox.value = isSuffix ? `${currentMessage}${ticket}` : `${ticket}${currentMessage}`
    vscode.commands.executeCommand("list.focusFirst");
    vscode.commands.executeCommand("list.select");
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

function getTicket(repository: Repository, branchName: string, branchRegEx: RegExp) {
  const { replacement = '[$1] ', replacementIsFunction } = vscode.workspace.getConfiguration('gitPrefix')
  const _replacement = replaceTokensInReplacement(repository, replacement);

  if (replacementIsFunction) {
    return branchName.replace(
      branchRegEx,
      (_substring: string, ...args: any[]) =>
        // eslint-disable-next-line no-new-func
        Function(
          ...(Array(args.length).fill(1).map((x, y) => `p${x + y}`)), // Build args 'p1', 'p2', 'p3'....
          `return ${_replacement}`
        )(...args)
    )
  }

  return branchName.replace(branchRegEx, _replacement)
}

function replaceTokensInReplacement(repository: Repository, replacement: string) {
  const tokens = {
    folder: repository.rootUri.path.split('/').slice(-1)[0],
    parentFolder: repository.rootUri.path.split('/').slice(-2,-1)[0],
  }

  return Object.entries(tokens).reduce((acc, [key, value]) =>
    acc.replace(`$${key}`, value)
  , replacement);
}

function getGitExtension () {
  const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git')
  const gitExtension = vscodeGit && vscodeGit.exports
  return gitExtension && gitExtension.getAPI(1)
}

export function deactivate () {
  // called when extension is deactivated
}
