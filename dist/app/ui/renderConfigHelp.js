/**
 * Explains, on the page itself, how to point it at a deployment.
 *
 * @param error - Why configuration failed.
 * @param document - The document to create elements with.
 * @returns A `<main class="config-help">` with an `<h1>`, one sentence naming the problem (which
 *   parameter is missing or wrong, quoting a bad value as text), an example URL
 *   `?deploymentId=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX&environment=prod-euw1` in a `<code>`, and a
 *   link to `?demo`.
 * @remarks Sets no `innerHTML`.
 */
export const renderConfigHelp = (error, document) => {
    const value = 'value' in error ? error.value : '';
    const problems = {
        MissingDeploymentId: 'The page URL has no deploymentId parameter.',
        InvalidDeploymentId: `The deploymentId "${value}" is not a deployment id (a UUID).`,
        MissingEnvironment: 'The page URL has no environment parameter.',
        UnknownEnvironment: `The environment "${value}" is not a Genesys Cloud region this page knows.`,
    };
    const main = document.createElement('main');
    main.className = 'config-help';
    const heading = document.createElement('h1');
    heading.textContent = 'This page needs a Messenger deployment';
    const problem = document.createElement('p');
    problem.textContent = problems[error.kind];
    const example = document.createElement('p');
    const code = document.createElement('code');
    code.textContent = '?deploymentId=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX&environment=prod-euw1';
    example.append('Add both parameters to the URL, for example ', code);
    const demo = document.createElement('p');
    const link = document.createElement('a');
    link.href = '?demo';
    link.textContent = 'run the scripted demo';
    demo.append('Or ', link, ' without a deployment.');
    main.append(heading, problem, example, demo);
    return main;
};