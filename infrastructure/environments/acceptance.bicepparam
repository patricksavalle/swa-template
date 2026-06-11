using '../main.bicep'

param projectName = 'swa-template'
param environmentName = 'acceptance'
param resourceNamePrefix = 'swa-template-acc'
param staticWebAppSkuName = 'Free'
param cosmosDatabaseName = 'app'
param cosmosContainers = [
  {
    name: 'items'
    partitionKeyPath: '/tenantId'
  }
]
param tags = {
  project: 'swa-template'
  environment: 'acceptance'
}
