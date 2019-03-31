import * as vscode from 'vscode';
import { GitExtension } from './api/git';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('gitPrefix.setMessage', async () => {
		const vscodeGit = vscode.extensions.getExtension<GitExtension>('vscode.git');
		const gitExtension = vscodeGit &&  vscodeGit.exports;
		const git = gitExtension && gitExtension.getAPI(1);
		if (!git) {
			vscode.window.showErrorMessage('Unable to load Git Extension');
			return;
		}

		vscode.commands.executeCommand('workbench.view.scm');
		for(let repo of git.repositories) {
			const prefixPattern: string = vscode.workspace.getConfiguration().get("gitPrefix.pattern") || '(.*)';
			const ignoreCase: boolean = vscode.workspace.getConfiguration().get("gitPrefix.patternIgnoreCase") || false;
			const branchRegEx = ignoreCase ? new RegExp(prefixPattern, 'i') : new RegExp(prefixPattern);
			const prefixReplacment: string = vscode.workspace.getConfiguration().get("gitPrefix.replacement") || '[$1] ';

			const branchName = repo.state.HEAD && repo.state.HEAD.name || '';
			if (branchRegEx.test(branchName)) {
				const ticket = branchName.replace(branchRegEx, prefixReplacment);
				repo.inputBox.value = `${ticket}${repo.inputBox.value}`;
			} else {
				const message = `Pattern ${prefixPattern} not found in branch ${branchName}`;
				const editPattern = 'Edit Pattern';
				let result = await vscode.window.showErrorMessage(message, { modal: false }, editPattern);
				if (result === editPattern) {
					vscode.commands.executeCommand('workbench.action.openSettings');
					vscode.commands.executeCommand('settings.action.clearSearchResults');
				}
			}
		}
	});

	context.subscriptions.push(disposable);
}

// called when extension is deactivated
export function deactivate() {}
