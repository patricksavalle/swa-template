using '../main.bicep'

param projectName = 'swa-template'
param environmentName = 'acceptance'
param location = 'westeurope'
param resourceNamePrefix = 'swa-template-acc'
param staticWebAppSkuName = 'Free'
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
  environment: 'acceptance'
}
