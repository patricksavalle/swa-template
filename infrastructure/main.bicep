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

var normalizedTags = union(tags, {
  project: projectName
  environment: environmentName
  provisionedBy: 'github-actions'
})

var staticWebAppName = 'swa-${resourceNamePrefix}'
var cosmosAccountName = 'cosmos-${resourceNamePrefix}'
var logAnalyticsName = 'law-${resourceNamePrefix}'
var appInsightsName = 'appi-${resourceNamePrefix}'
var cosmosContainerNames = [for container in cosmosContainers: container.name]

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
    STATIC_WEB_APP_NAME: staticWebApp.name
    CIAM_TENANT_ID: ciamTenantId
    CIAM_TENANT_NAME: ciamTenantName
    CIAM_CLIENT_ID: ciamClientId
    COSMOS_ACCOUNT_NAME: cosmosAccount.name
    COSMOS_ENDPOINT: cosmosAccount.properties.documentEndpoint
    COSMOS_DATABASE_NAME: cosmosDatabaseName
    COSMOS_CONTAINER_NAMES: join(cosmosContainerNames, ',')
    LOG_ANALYTICS_WORKSPACE_NAME: logAnalytics.name
    APPLICATION_INSIGHTS_NAME: appInsights.name
    APPLICATIONINSIGHTS_CONNECTION_STRING: appInsights.properties.ConnectionString
  }
}

output staticWebAppName string = staticWebApp.name
output cosmosAccountName string = cosmosAccount.name
output cosmosDatabaseName string = cosmosDatabaseName
output logAnalyticsWorkspaceName string = logAnalytics.name
output applicationInsightsName string = appInsights.name
