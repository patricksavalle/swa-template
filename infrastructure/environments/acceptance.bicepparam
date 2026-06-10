using '../main.bicep'

param projectName = 'l-gevity'
param environmentName = 'acceptance'
param location = 'westeurope'
param resourceNamePrefix = 'l-gevity-acc'
param staticWebAppSkuName = 'Free'
param cosmosDatabaseName = 'lgevity'
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
  project: 'l-gevity'
  environment: 'acceptance'
}
