using '../main.bicep'

param projectName = 'swa-template'
param environmentName = 'production'
param location = 'westeurope'
param resourceNamePrefix = 'swa-template-prd'
param staticWebAppSkuName = 'Standard'
param cosmosDatabaseName = 'app'
param cosmosContainers = [
  {
    name: 'users'
    partitionKeyPath: '/tenantId'
  }
  {
    name: 'sessions'
    partitionKeyPath: '/tenantId'
  }
  {
    name: 'events'
    partitionKeyPath: '/tenantId'
  }
]
param tags = {
  project: 'swa-template'
  environment: 'production'
}
