/**
 * The host that serves `genesys.min.js` for each documented Messenger `environment` value.
 * Every entry was confirmed with a live GET on 2026-10-01 and matches the SDK's own
 * service-discovery table, including `prod-apse1` and `prod-mxc1`, which the `genesysgf` page omits; see docs/guides/loading-the-sdk.md, "Script URL per environment".
 * Genesys forbids self-hosting the script, so the page must load it from the region's host.
 */
export const scriptHosts = {
    prod: 'apps.mypurecloud.com',
    'fedramp-use2-core': 'apps.use2.us-gov-pure.cloud',
    'prod-usw2': 'apps.usw2.pure.cloud',
    'prod-cac1': 'apps.cac1.pure.cloud',
    'prod-euw1': 'apps.mypurecloud.ie',
    'prod-euw2': 'apps.euw2.pure.cloud',
    'prod-euc1': 'apps.mypurecloud.de',
    'prod-euc2': 'apps.euc2.pure.cloud',
    'prod-aps1': 'apps.aps1.pure.cloud',
    'prod-apne1': 'apps.mypurecloud.jp',
    'prod-apne2': 'apps.apne2.pure.cloud',
    'prod-apne3': 'apps.apne3.pure.cloud',
    'prod-apse1': 'apps.apse1.pure.cloud',
    'prod-apse2': 'apps.mypurecloud.com.au',
    'prod-sae1': 'apps.sae1.pure.cloud',
    'prod-mec1': 'apps.mec1.pure.cloud',
    'prod-mxc1': 'apps.mxc1.pure.cloud',
};