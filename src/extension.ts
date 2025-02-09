// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

console.log('squiggly-bugs!');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "squiggly-bugs" is now active!');

	// Create a diagnostic collection named "helloSquiggles"
	const diagnosticCollection = vscode.languages.createDiagnosticCollection('helloSquiggles');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const commandDisposable = vscode.commands.registerCommand('squiggly-bugs.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		if (vscode.window.activeTextEditor) {
			updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
			vscode.window.showInformationMessage('Added squiggles for "hello" in the current document!');
		}
	});

	// Register a listener for document saves
	const saveDisposable = vscode.workspace.onDidSaveTextDocument(document => {
		updateDiagnostics(document, diagnosticCollection);
	});

	context.subscriptions.push(commandDisposable, saveDisposable);
}

function updateDiagnostics(document: vscode.TextDocument, diagnosticCollection: vscode.DiagnosticCollection): void {
	console.log('updateDiagnostics', document.uri);

	const text = document.getText();
	const pattern = /hello/g;
	const diagnostics: vscode.Diagnostic[] = [];
	let match: RegExpExecArray | null;

	while ((match = pattern.exec(text)) !== null) {
		const startPos = document.positionAt(match.index);
		const endPos = document.positionAt(match.index + match[0].length);
		const range = new vscode.Range(startPos, endPos);
		// Create a diagnostic with a Warning severity (this will render a squiggly underline)
		const diagnostic = new vscode.Diagnostic(range, 'Found "hello"', vscode.DiagnosticSeverity.Error);
		diagnostic.source = 'helloSquiggles';
		diagnostics.push(diagnostic);
	}

	diagnosticCollection.set(document.uri, diagnostics);
}

// This method is called when your extension is deactivated
export function deactivate() {}
