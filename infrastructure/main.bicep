targetScope = 'resourceGroup'

@description('Project name.')
param projectName string = 'swa-template'

@allowed([
  'acceptance'
  'production'
])
@description('Deployment environment.')
param environmentName string

@description('Azure region for regional resources.')
param location string = resourceGroup().location

@description('Short, globally-safe prefix used in Azure resource names.')
param resourceNamePrefix string

@allowed([
  'Free'
  'Standard'
])
@description('Static Web App SKU.')
param staticWebAppSkuName string = 'Free'

@description('CIAM tenant id. Seeded from GitHub environment secrets during workflow execution.')
param ciamTenantId string = ''

@description('CIAM tenant name, for diagnostics and app configuration.')
param ciamTenantName string = ''

@description('CIAM app registration client id. Seeded from GitHub environment secrets during workflow execution.')
param ciamClientId string = ''

@description('Cosmos DB SQL database name.')
param cosmosDatabaseName string = 'app'

@description('Cosmos DB containers to create.')
param cosmosContainers array = [
  {
    name: 'items'
    partitionKeyPath: '/tenantId'
  }
]

@description('Common resource tags.')
param tags object = {}

@description('Email receiver for optional platform alerts. Leave empty to skip alert resources.')
param alertEmail string = ''

var normalizedTags = union(tags, {
  project: projectName
  environment: environmentName
  provisionedBy: 'github-actions'
})

var staticWebAppName = 'swa-${resourceNamePrefix}'
var cosmosAccountName = 'cosmos-${resourceNamePrefix}'
var logAnalyticsName = 'law-${resourceNamePrefix}'
var appInsightsName = 'appi-${resourceNamePrefix}'
var identityName = 'id-${resourceNamePrefix}'
var actionGroupName = 'ag-${resourceNamePrefix}'
var availabilityAlertName = 'alert-${resourceNamePrefix}-availability'
var alertingEnabled = !empty(alertEmail)

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: normalizedTags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: environmentName == 'production' ? 90 : 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  tags: normalizedTags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
  tags: normalizedTags
}

resource cosmosAccount 'Microsoft.DocumentDB/databaseAccounts@2024-05-15' = {
  name: cosmosAccountName
  location: location
  tags: normalizedTags
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: environmentName == 'production'
      }
    ]
  }
}

resource cosmosDatabase 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2024-05-15' = {
  parent: cosmosAccount
  name: cosmosDatabaseName
  properties: {
    resource: {
      id: cosmosDatabaseName
    }
  }
}

resource cosmosContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2024-05-15' = [for container in cosmosContainers: {
  parent: cosmosDatabase
  name: container.name
  properties: {
    resource: {
      id: container.name
      partitionKey: {
        paths: [
          container.partitionKeyPath
        ]
        kind: 'Hash'
      }
    }
  }
}]

resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  tags: normalizedTags
  sku: {
    name: staticWebAppSkuName
    tier: staticWebAppSkuName
  }
  properties: {
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

resource staticWebAppSettings 'Microsoft.Web/staticSites/config@2023-12-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    APP_ENV: environmentName
    PROJECT_NAME: projectName
    CIAM_TENANT_ID: ciamTenantId
    CIAM_TENANT_NAME: ciamTenantName
    CIAM_CLIENT_ID: ciamClientId
    COSMOS_ACCOUNT_NAME: cosmosAccount.name
    COSMOS_ENDPOINT: cosmosAccount.properties.documentEndpoint
    COSMOS_DATABASE_NAME: cosmosDatabaseName
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.properties.ConnectionString
  }
}

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = if (alertingEnabled) {
  name: actionGroupName
  location: 'global'
  tags: normalizedTags
  properties: {
    groupShortName: take(replace(resourceNamePrefix, '-', ''), 12)
    enabled: true
    emailReceivers: [
      {
        name: 'primary'
        emailAddress: alertEmail
        useCommonAlertSchema: true
      }
    ]
  }
}

resource failedRequestAlert 'Microsoft.Insights/scheduledQueryRules@2023-12-01' = if (alertingEnabled) {
  name: availabilityAlertName
  location: location
  tags: normalizedTags
  properties: {
    displayName: 'Failed requests - ${resourceNamePrefix}'
    description: 'Alerts when Application Insights records failed requests in the last five minutes.'
    enabled: true
    severity: environmentName == 'production' ? 2 : 3
    scopes: [
      logAnalytics.id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT5M'
    criteria: {
      allOf: [
        {
          query: 'AppRequests | where Success == false'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 0
          failingPeriods: {
            numberOfEvaluationPeriods: 1
            minFailingPeriodsToAlert: 1
          }
        }
      ]
    }
    actions: {
      actionGroups: [
        actionGroup.id
      ]
    }
  }
}

output staticWebAppName string = staticWebApp.name
output cosmosAccountName string = cosmosAccount.name
output cosmosDatabaseName string = cosmosDatabaseName
output logAnalyticsWorkspaceName string = logAnalytics.name
output applicationInsightsName string = appInsights.name
output managedIdentityClientId string = managedIdentity.properties.clientId
