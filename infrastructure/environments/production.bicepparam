using '../main.bicep'

param projectName = 'swa-template'
param environmentName = 'production'
param resourceNamePrefix = 'swa-template-prd'
param staticWebAppSkuName = 'Standard'
param cosmosDatabaseName = 'app'
param cosmosContainers = [
  {
    name: 'items'
    partitionKeyPath: '/tenantId'
  }
]
param tags = {
  project: 'swa-template'
  environment: 'production'
}
