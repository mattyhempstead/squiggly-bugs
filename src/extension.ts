// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { findBugs } from './ai/findBugs';

console.log('squiggly-bugs!');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "squiggly-bugs" is now active!');

	// Create a diagnostic collection named "helloSquiggles"
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('squigglyBugs');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const commandDisposable = vscode.commands.registerCommand('squiggly-bugs.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		if (vscode.window.activeTextEditor) {
			await updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
		}
	});

	// Register a listener for document saves
	const saveDisposable = vscode.workspace.onDidSaveTextDocument(async document => {
		await updateDiagnostics(document, diagnosticCollection);
	});

	context.subscriptions.push(commandDisposable, saveDisposable);
}

async function updateDiagnostics(document: vscode.TextDocument, diagnosticCollection: vscode.DiagnosticCollection): Promise<void> {
	await new Promise(resolve => setTimeout(resolve, 1000));

	vscode.window.showInformationMessage('Checking for bugs in the current document!');
	console.log('updateDiagnostics', document.uri);

	const text = document.getText();
	const bugRanges = await findBugs(text);
	const diagnostics: vscode.Diagnostic[] = [];

	for (const range of bugRanges) {
		const startPos = new vscode.Position(range.startLineNumber - 1, range.startColumnNumber);
		const endPos = new vscode.Position(range.endLineNumber - 1, range.endColumnNumber);
		const vsRange = new vscode.Range(startPos, endPos);
		const diagnostic = new vscode.Diagnostic(vsRange, range.description, vscode.DiagnosticSeverity.Error);
		diagnostic.source = 'squigglyBugs';
		diagnostics.push(diagnostic);
	}

	diagnosticCollection.set(document.uri, diagnostics);
}

// This method is called when your extension is deactivated
export function deactivate() {}
