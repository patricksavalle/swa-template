using '../main.bicep'

param projectName = 'l-gevity'
param environmentName = 'production'
param location = 'westeurope'
param resourceNamePrefix = 'l-gevity-prd'
param staticWebAppSkuName = 'Standard'
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
  environment: 'production'
}
